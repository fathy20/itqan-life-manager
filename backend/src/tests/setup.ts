import { vi } from "vitest";

// ── Mock environment variables before anything imports config ──
process.env.NODE_ENV = "test";
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.FIREBASE_CLIENT_EMAIL = "test@test.iam.gserviceaccount.com";
process.env.FIREBASE_PRIVATE_KEY = "test-key";
process.env.GEMINI_API_KEY = "test-gemini-key";
process.env.ALLOWED_ORIGINS = "http://localhost:3000";
process.env.PORT = "5001";

// ── Mock firebase-admin ─────────────────────────────────────────
vi.mock("firebase-admin", () => {
  const mockAuth = {
    verifyIdToken: vi.fn(),
  };
  const mockFirestore = {
    collection: vi.fn(),
  };
  return {
    default: {
      apps: [],
      initializeApp: vi.fn(),
      credential: { cert: vi.fn() },
      auth: vi.fn(() => mockAuth),
      firestore: vi.fn(() => mockFirestore),
    },
    apps: [],
    initializeApp: vi.fn(),
    credential: { cert: vi.fn() },
    auth: vi.fn(() => mockAuth),
    firestore: vi.fn(() => mockFirestore),
  };
});

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
    increment: vi.fn((n: number) => n),
  },
  Timestamp: {
    fromDate: vi.fn((d: Date) => d),
  },
}));

// ── Mock Gemini ─────────────────────────────────────────────────
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: vi.fn().mockReturnValue("مرحبا! أنا إتقان كوتش.") },
      }),
    }),
  })),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({ text: "Test AI response" }),
    },
  })),
}));
