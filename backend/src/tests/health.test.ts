import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";

// Mock lib/firebase-admin before importing app
vi.mock("../lib/firebase-admin", () => ({
  db: { collection: vi.fn() },
  auth: { verifyIdToken: vi.fn() },
}));

let app: any;

beforeAll(async () => {
  const mod = await import("../index");
  app = mod.default;
});

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("ok");
    expect(res.body.version).toBe("2.0.0");
    expect(res.body.timestamp).toBeDefined();
  });
});

describe("Unknown routes", () => {
  it("returns 404 for unknown paths", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
