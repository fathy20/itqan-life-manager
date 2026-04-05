import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";

const mockVerifyIdToken = vi.fn();

vi.mock("../lib/firebase-admin", () => ({
  auth: { verifyIdToken: mockVerifyIdToken },
  db: { collection: vi.fn() },
}));

const { authMiddleware } = await import("../middleware/auth");

function makeRes() {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis() as any,
    json: vi.fn().mockReturnThis() as any,
  };
  return res as Response;
}

beforeEach(() => {
  mockVerifyIdToken.mockReset();
});

describe("authMiddleware", () => {
  it("rejects request with no Authorization header", async () => {
    const req: any = { headers: {} };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects request with malformed Authorization header", async () => {
    const req: any = { headers: { authorization: "Token abc" } };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects expired or invalid tokens", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("expired"));
    const req: any = { headers: { authorization: "Bearer bad-token" } };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches uid and user to request on success", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "user-42", email: "x@y.com" });
    const req: any = { headers: { authorization: "Bearer good-token" } };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(req.uid).toBe("user-42");
    expect(req.user).toEqual({ uid: "user-42", email: "x@y.com" });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("passes only the token portion to verifyIdToken", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "u1" });
    const req: any = { headers: { authorization: "Bearer my-actual-token" } };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(mockVerifyIdToken).toHaveBeenCalledWith("my-actual-token");
  });
});
