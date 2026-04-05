import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";

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

vi.mock("../lib/firebase-admin", () => ({
  db: { collection: mockCollection },
  auth: { verifyIdToken: vi.fn() },
}));

const { requirePlan, requireFeature, checkAIUsage } = await import("../middleware/planGate");

function makeRes() {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis() as any,
    json: vi.fn().mockReturnThis() as any,
  };
  return res as Response;
}

beforeEach(() => {
  mockGet.mockReset();
  mockSet.mockClear();
  mockUpdate.mockClear();
});

describe("requirePlan()", () => {
  it("blocks free user from pro-only route", async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await requirePlan("pro")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    const body = (res.json as any).mock.calls[0][0];
    expect(body.code).toBe("PLAN_LIMIT");
    expect(body.requiredPlan).toBe("pro");
    expect(body.currentPlan).toBe("free");
  });

  it("allows pro user on pro route", async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ planType: "pro" }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await requirePlan("pro")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("allows premium user on pro route", async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ planType: "premium" }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await requirePlan("pro")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("blocks pro user from premium route", async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ planType: "pro" }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await requirePlan("premium")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("requireFeature()", () => {
  it("blocks free user from aiDailyPlan feature", async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await requireFeature("aiDailyPlan")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    const body = (res.json as any).mock.calls[0][0];
    expect(body.code).toBe("PLAN_LIMIT");
    expect(body.feature).toBe("aiDailyPlan");
  });

  it("allows free user on aiCoach feature", async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await requireFeature("aiCoach")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("blocks pro user from aiStudyStrategy (premium-only)", async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ planType: "pro" }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await requireFeature("aiStudyStrategy")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("checkAIUsage()", () => {
  it("returns 429 when free user hits daily cap", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ aiRequestsToday: 5, resetDate: today }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await checkAIUsage(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
    const body = (res.json as any).mock.calls[0][0];
    expect(body.code).toBe("AI_DAILY_LIMIT");
    expect(body.plan).toBe("free");
  });

  it("allows and attaches aiRemaining when under limit", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ planType: "free" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ aiRequestsToday: 2, resetDate: today }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await checkAIUsage(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect((req as any).aiRemaining).toBe(2); // 5 - 2 - 1
  });

  it("allows premium user unconditionally", async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ planType: "premium" }) });
    const req: any = { uid: "u1" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await checkAIUsage(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect((req as any).aiRemaining).toBe(-1);
  });
});
