import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the firebase-admin lib used by the service
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockUpdate = vi.fn();

const mockDoc = vi.fn(() => ({
  get: mockGet,
  set: mockSet,
  update: mockUpdate,
  collection: vi.fn(() => ({
    doc: mockDoc,
  })),
}));

const mockCollection = vi.fn(() => ({
  doc: mockDoc,
}));

vi.mock("../lib/firebase-admin", () => ({
  db: { collection: mockCollection },
  auth: { verifyIdToken: vi.fn() },
}));

// Import after mocks are set up
const { getUserPlan, checkFeatureAccess, checkAndIncrementAI, ensureSubscriptionDoc } =
  await import("../modules/subscription/subscription.service");

beforeEach(() => {
  mockGet.mockReset();
  mockSet.mockReset();
  mockUpdate.mockReset();
});

describe("getUserPlan()", () => {
  it("returns 'free' when no subscription doc exists", async () => {
    mockGet.mockResolvedValue({ exists: false, data: () => undefined });
    const plan = await getUserPlan("uid-1");
    expect(plan).toBe("free");
  });

  it("returns the stored planType when doc exists", async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ planType: "pro" }) });
    const plan = await getUserPlan("uid-1");
    expect(plan).toBe("pro");
  });

  it("returns 'free' when doc exists but planType is missing", async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({}) });
    const plan = await getUserPlan("uid-1");
    expect(plan).toBe("free");
  });

  it("returns 'premium' for premium users", async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ planType: "premium" }) });
    expect(await getUserPlan("uid-1")).toBe("premium");
  });
});

describe("checkFeatureAccess()", () => {
  it("denies aiDailyPlan for free users", async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ planType: "free" }) });
    expect(await checkFeatureAccess("uid-1", "aiDailyPlan")).toBe(false);
  });

  it("allows aiCoach for free users", async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ planType: "free" }) });
    expect(await checkFeatureAccess("uid-1", "aiCoach")).toBe(true);
  });

  it("allows aiDailyPlan for pro users", async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ planType: "pro" }) });
    expect(await checkFeatureAccess("uid-1", "aiDailyPlan")).toBe(true);
  });

  it("denies aiStudyStrategy for pro users (premium-only)", async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ planType: "pro" }) });
    expect(await checkFeatureAccess("uid-1", "aiStudyStrategy")).toBe(false);
  });

  it("allows all features for premium users", async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ planType: "premium" }) });
    expect(await checkFeatureAccess("uid-1", "aiStudyStrategy")).toBe(true);
    expect(await checkFeatureAccess("uid-1", "aiFinanceInsights")).toBe(true);
  });
});

describe("checkAndIncrementAI()", () => {
  it("grants unlimited quota to premium users", async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({ planType: "premium" }) });
    const result = await checkAndIncrementAI("uid-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(-1);
    expect(result.plan).toBe("premium");
  });

  it("creates a fresh usage doc when none exists and returns quota-1", async () => {
    // first get: plan doc. second get: usage doc.
    mockGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) })
      .mockResolvedValueOnce({ exists: false, data: () => undefined });
    const result = await checkAndIncrementAI("uid-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // free=5, 5-1=4
    expect(mockSet).toHaveBeenCalledOnce();
  });

  it("resets usage when resetDate is yesterday", async () => {
    mockGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ aiRequestsToday: 5, resetDate: "2020-01-01" }) });
    const result = await checkAndIncrementAI("uid-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(mockSet).toHaveBeenCalledOnce();
  });

  it("increments and allows when under limit", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ aiRequestsToday: 2, resetDate: today }) });
    const result = await checkAndIncrementAI("uid-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2); // 5 - 2 - 1 = 2
    expect(mockUpdate).toHaveBeenCalledOnce();
  });

  it("blocks when daily limit is reached", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ aiRequestsToday: 5, resetDate: today }) });
    const result = await checkAndIncrementAI("uid-1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("blocks pro user at 30 requests", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "pro" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ aiRequestsToday: 30, resetDate: today }) });
    const result = await checkAndIncrementAI("uid-1");
    expect(result.allowed).toBe(false);
    expect(result.plan).toBe("pro");
  });

  it("fails open on firestore errors", async () => {
    mockGet.mockRejectedValueOnce(new Error("firestore down"));
    const result = await checkAndIncrementAI("uid-1");
    expect(result.allowed).toBe(true);
    expect(result.plan).toBe("free");
  });
});

describe("ensureSubscriptionDoc()", () => {
  it("creates a free-tier doc when none exists", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    await ensureSubscriptionDoc("uid-1");
    expect(mockSet).toHaveBeenCalledOnce();
    const writtenData = mockSet.mock.calls[0][0];
    expect(writtenData.planType).toBe("free");
    expect(writtenData.status).toBe("active");
    expect(writtenData.createdAt).toBeDefined();
  });

  it("does not overwrite when doc already exists", async () => {
    mockGet.mockResolvedValueOnce({ exists: true });
    await ensureSubscriptionDoc("uid-1");
    expect(mockSet).not.toHaveBeenCalled();
  });
});
