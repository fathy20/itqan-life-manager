// ═══════════════════════════════════════════════════════════════
//  backend/src/middleware/auth.ts
//  Firebase Token Verification Middleware
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebase";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No auth token provided",
      code: "AUTH_MISSING",
    });
  }

  const token = header.split("Bearer ")[1];

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    (req as any).uid = decoded.uid;
    (req as any).email = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      code: "AUTH_INVALID",
    });
  }
}


// ═══════════════════════════════════════════════════════════════
//  backend/src/middleware/validate.ts
//  Zod Schema Validation Middleware
// ═══════════════════════════════════════════════════════════════

import { z, ZodSchema } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === "body" ? req.body : source === "query" ? req.query : req.params;
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors,
      });
    }

    // Replace with parsed (coerced) data
    if (source === "body") req.body = result.data;
    if (source === "query") (req as any).query = result.data;

    next();
  };
}


// ═══════════════════════════════════════════════════════════════
//  backend/src/middleware/errorHandler.ts
//  Global Error Handler
// ═══════════════════════════════════════════════════════════════

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("[ERROR]", err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error";
  const code = err.code || "INTERNAL_ERROR";

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}


// ═══════════════════════════════════════════════════════════════
//  backend/src/middleware/rateLimiter.ts
//  Rate Limiting — General + AI-specific
// ═══════════════════════════════════════════════════════════════

import rateLimit from "express-rate-limit";

// General: 200 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests", code: "RATE_LIMIT" },
});

// AI endpoints: 30 requests per 15 minutes
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "AI rate limit reached. Upgrade for more.", code: "AI_RATE_LIMIT" },
});
