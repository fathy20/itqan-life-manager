// ═══════════════════════════════════════════════════════════════
//  backend/src/app.ts
//  Express Application — wires all modules together
// ═══════════════════════════════════════════════════════════════

import express from "express";
import cors from "cors";
import { getConfig } from "./config/env";
import { generalLimiter, aiLimiter } from "./middleware/index";

// ─── Import route modules ────────────────────────────────────
import salahRoutes from "./modules/salah/salah.routes";
// Pattern: import each module's routes the same way
// import quranRoutes   from "./modules/quran/quran.routes";
// import adhkarRoutes  from "./modules/adhkar/adhkar.routes";
// import fastingRoutes from "./modules/fasting/fasting.routes";
// import zakatRoutes   from "./modules/zakat/zakat.routes";
// import studyRoutes   from "./modules/study/study.routes";
// import workRoutes    from "./modules/work/work.routes";
// import financeRoutes from "./modules/finance/finance.routes";
// import lifestyleRoutes from "./modules/lifestyle/lifestyle.routes";
// import focusRoutes   from "./modules/focus/focus.routes";
// import scoreRoutes   from "./modules/score/score.routes";
// import halaqahRoutes from "./modules/halaqah/halaqah.routes";
// import aiRoutes      from "./modules/ai/ai.routes";
// import intelligenceRoutes from "./modules/intelligence/intelligence.routes";
// import subscriptionRoutes from "./modules/subscription/subscription.routes";
// import profileRoutes from "./modules/profile/profile.routes";
// import authRoutes    from "./modules/auth/auth.routes";

const config = getConfig();
const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: config.ALLOWED_ORIGINS.split(","),
  credentials: true,
}));
app.use(express.json());
app.use(generalLimiter);

// ─── Health Check ────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════
//  ROUTE MOUNTING — /api/v1/*
//  Each module gets its own prefix under /api/v1
// ═══════════════════════════════════════════════════════════════

const v1 = express.Router();

// ── Worship modules ──────────────────────────────────────────
v1.use("/salah", salahRoutes);
// v1.use("/quran",   quranRoutes);
// v1.use("/adhkar",  adhkarRoutes);
// v1.use("/fasting", fastingRoutes);
// v1.use("/zakat",   zakatRoutes);

// ── Life modules (existing — keep backward compatible) ───────
// v1.use("/auth",       authRoutes);
// v1.use("/profile",    profileRoutes);
// v1.use("/subjects",   studyRoutes);
// v1.use("/tasks",      workRoutes);     // tasks + projects + courses
// v1.use("/projects",   projectRoutes);
// v1.use("/courses",    courseRoutes);
// v1.use("/finance",    financeRoutes);  // transactions + wishlist + commitments
// v1.use("/habits",     lifestyleRoutes);
// v1.use("/lifestyle",  lifestyleRoutes);

// ── New modules ──────────────────────────────────────────────
// v1.use("/focus",          focusRoutes);
// v1.use("/score",          scoreRoutes);
// v1.use("/halaqah",        halaqahRoutes);
// v1.use("/intelligence",   intelligenceRoutes);
// v1.use("/subscription",   subscriptionRoutes);

// ── AI module (separate rate limiter) ────────────────────────
// v1.use("/ai", aiLimiter, aiRoutes);

app.use("/api/v1", v1);

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found", code: "NOT_FOUND" });
});

// ─── Error handler ───────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[ERROR]", err.message || err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.isOperational ? err.message : "Internal server error",
    code: err.code || "INTERNAL_ERROR",
  });
});

export default app;


// ═══════════════════════════════════════════════════════════════
//  backend/src/index.ts
//  Entry point — starts the server
// ═══════════════════════════════════════════════════════════════

// import "dotenv/config";
// import app from "./app";
// import { getConfig } from "./config/env";
//
// const config = getConfig();
//
// app.listen(config.PORT, () => {
//   console.log(`🚀 Itqan API running on port ${config.PORT}`);
//   console.log(`📋 Environment: ${config.NODE_ENV}`);
// });
