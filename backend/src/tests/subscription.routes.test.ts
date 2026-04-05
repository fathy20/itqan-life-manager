import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import request from "supertest";

// Mock firestore behaviour per-test
const mockGet = vi.fn();
const mockSet = vi.fn().mockResolvedValue(undefined);
const mockUpdate = vi.fn().mockResolvedValue(undefined);

const mockDoc = vi.fn(() => ({
  get: mockGet,
  set: mockSet,
  update: mockUpdate,
  collection: vi.fn(() => ({ doc: mockDoc })),
}));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));

// Mock auth to always succeed for "Bearer test-token"
const mockVerifyIdToken = vi.fn().mockResolvedValue({ uid: "test-uid-123" });

vi.mock("../lib/firebase-admin", () => ({
  db: { collection: mockCollection },
  auth: { verifyIdToken: mockVerifyIdToken },
}));

let app: any;
beforeAll(async () => {
  const mod = await import("../index");
  app = mod.default;
});

beforeEach(() => {
  mockGet.mockReset();
  mockSet.mockClear();
  mockUpdate.mockClear();
});

const AUTH = { Authorization: "Bearer test-token" };

describe("GET /api/v1/subscription", () => {
  it("returns 401 without auth header", async () => {
    const res = await request(app).get("/api/v1/subscription");
    expect(res.status).toBe(401);
  });

  it("returns free plan with limits for new users", async () => {
    // 1st get: ensureSubscriptionDoc → doesn't exist → creates free doc
    // 2nd get: getUserPlan → doc now exists with free plan
    // 3rd get: usage doc → no usage yet
    mockGet
      .mockResolvedValueOnce({ exists: false })
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) })
      .mockResolvedValueOnce({ exists: false });

    const res = await request(app).get("/api/v1/subscription").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.planType).toBe("free");
    expect(res.body.data.limits.aiRequestsPerDay).toBe(5);
    expect(res.body.data.limits.features.aiCoach).toBe(true);
    expect(res.body.data.limits.features.aiDailyPlan).toBe(false);
    expect(res.body.data.usage.aiRequestsToday).toBe(0);
    expect(res.body.data.usage.aiRequestsRemaining).toBe(5);
  });

  it("reports remaining quota for pro users with existing usage", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockGet
      .mockResolvedValueOnce({ exists: true }) // ensureSubscriptionDoc: doc exists, skip
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "pro" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ aiRequestsToday: 12, resetDate: today }) });

    const res = await request(app).get("/api/v1/subscription").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.planType).toBe("pro");
    expect(res.body.data.limits.aiRequestsPerDay).toBe(30);
    expect(res.body.data.usage.aiRequestsToday).toBe(12);
    expect(res.body.data.usage.aiRequestsRemaining).toBe(18);
  });

  it("returns -1 remaining for premium users (unlimited)", async () => {
    mockGet
      .mockResolvedValueOnce({ exists: true })
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "premium" }) })
      .mockResolvedValueOnce({ exists: false });

    const res = await request(app).get("/api/v1/subscription").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.planType).toBe("premium");
    expect(res.body.data.usage.aiRequestsRemaining).toBe(-1);
  });

  it("ignores stale usage data from a previous day", async () => {
    mockGet
      .mockResolvedValueOnce({ exists: true })
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ aiRequestsToday: 999, resetDate: "2020-01-01" }) });

    const res = await request(app).get("/api/v1/subscription").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.usage.aiRequestsToday).toBe(0);
  });
});

describe("GET /api/v1/subscription/plans", () => {
  it("returns all three plan tiers", async () => {
    const res = await request(app).get("/api/v1/subscription/plans").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.free).toBeDefined();
    expect(res.body.data.pro).toBeDefined();
    expect(res.body.data.premium).toBeDefined();
  });
});

describe("POST /api/v1/subscription", () => {
  it("rejects invalid planType", async () => {
    const res = await request(app)
      .post("/api/v1/subscription")
      .set(AUTH)
      .send({ planType: "ultra" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects missing planType", async () => {
    const res = await request(app).post("/api/v1/subscription").set(AUTH).send({});
    expect(res.status).toBe(400);
  });

  it("updates plan to pro", async () => {
    const res = await request(app)
      .post("/api/v1/subscription")
      .set(AUTH)
      .send({ planType: "pro" });
    expect(res.status).toBe(200);
    expect(res.body.data.planType).toBe("pro");
    expect(mockSet).toHaveBeenCalledOnce();
    const written = mockSet.mock.calls[0][0];
    expect(written.planType).toBe("pro");
    expect(written.status).toBe("active");
  });
});
