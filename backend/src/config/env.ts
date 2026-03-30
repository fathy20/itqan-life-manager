import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_CLIENT_EMAIL: z.string().optional().default(""),
  FIREBASE_PRIVATE_KEY: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  RATE_LIMIT_MAX: z.string().default("200"),
  AI_RATE_LIMIT_MAX: z.string().default("30"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  parsed.error.issues.forEach(i => console.error(`  - ${i.path.join(".")}: ${i.message}`));
  process.exit(1);
}

export const config = {
  port: parseInt(parsed.data.PORT),
  nodeEnv: parsed.data.NODE_ENV,
  isProd: parsed.data.NODE_ENV === "production",
  firebase: {
    projectId: parsed.data.FIREBASE_PROJECT_ID,
    clientEmail: parsed.data.FIREBASE_CLIENT_EMAIL,
    privateKey: parsed.data.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  gemini: { apiKey: parsed.data.GEMINI_API_KEY },
  cors: { origins: parsed.data.ALLOWED_ORIGINS.split(",") },
  rateLimit: {
    windowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS),
    max: parseInt(parsed.data.RATE_LIMIT_MAX),
    aiMax: parseInt(parsed.data.AI_RATE_LIMIT_MAX),
  },
};
