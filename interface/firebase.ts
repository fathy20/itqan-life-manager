// ═══════════════════════════════════════════════════════════════
//  backend/src/config/firebase.ts
//  Firebase Admin SDK — Firestore + Auth
// ═══════════════════════════════════════════════════════════════

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = getFirestore();
export const adminAuth = getAuth();


// ═══════════════════════════════════════════════════════════════
//  backend/src/config/env.ts
//  Environment Variable Validation
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),

  // Gemini AI (BACKEND ONLY — never in frontend)
  GEMINI_API_KEY: z.string().min(1),

  // CORS
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  AI_RATE_LIMIT_MAX: z.coerce.number().default(30),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _config: EnvConfig;

export function getConfig(): EnvConfig {
  if (!_config) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error("❌ Invalid environment variables:");
      result.error.errors.forEach(e => {
        console.error(`  ${e.path.join(".")}: ${e.message}`);
      });
      process.exit(1);
    }
    _config = result.data;
  }
  return _config;
}
