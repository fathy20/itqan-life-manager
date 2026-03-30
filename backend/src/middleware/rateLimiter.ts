import rateLimit from "express-rate-limit";
import { config } from "../config/env";

export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: "Too many requests", code: "RATE_LIMIT" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.rateLimit.aiMax,
  message: { success: false, message: "AI rate limit exceeded", code: "AI_RATE_LIMIT" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts", code: "AUTH_RATE_LIMIT" },
});
