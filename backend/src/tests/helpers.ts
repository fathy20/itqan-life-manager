import { vi } from "vitest";

// ── Firestore mock builder ──────────────────────────────────────
export function buildFirestoreMock(docs: any[] = []) {
  const snapshot = {
    docs: docs.map((d, i) => ({
      id: d.id ?? `doc-${i}`,
      data: () => d,
      exists: true,
    })),
    forEach: (cb: any) => docs.forEach((d, i) => cb({ id: d.id ?? `doc-${i}`, data: () => d, exists: true })),
  };

  const docMock = (data?: any) => ({
    get: vi.fn().mockResolvedValue({
      id: data?.id ?? "doc-1",
      exists: data !== undefined,
      data: () => data,
    }),
    set: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  });

  const colMock = {
    get: vi.fn().mockResolvedValue(snapshot),
    add: vi.fn().mockResolvedValue({ id: "new-doc-id" }),
    doc: vi.fn((id?: string) => ({
      ...docMock({ id: id ?? "doc-1" }),
      collection: vi.fn(() => colMock),
    })),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };

  return colMock;
}

/** Returns a mock Firebase auth token header */
export const AUTH_HEADER = { Authorization: "Bearer test-token" };

/** UID returned by the mocked auth middleware */
export const TEST_UID = "test-uid-123";

/** Setup the auth middleware mock to always authenticate as TEST_UID */
export function mockAuthMiddleware() {
  // This is handled by mocking firebase-admin's verifyIdToken in tests
  return TEST_UID;
}
