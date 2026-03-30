import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/env";
import { generalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import subjectsRoutes from "./routes/subjects";
import tasksRoutes from "./routes/tasks";
import projectsRoutes from "./routes/projects";
import coursesRoutes from "./routes/courses";
import financeRoutes from "./routes/finance";
import habitsRoutes from "./routes/habits";
import lifestyleRoutes from "./routes/lifestyle";
import aiRoutes from "./modules/ai/ai.routes";
import intelligenceRoutes from "./modules/intelligence/intelligence.routes";
// Islamic modules
import salahRoutes from "./modules/salah/salah.routes";
import quranRoutes from "./modules/quran/quran.routes";
import adhkarRoutes from "./modules/adhkar/adhkar.routes";
import scoreRoutes from "./modules/score/score.routes";
import fastingRoutes from "./modules/fasting/fasting.routes";
import halaqahRoutes from "./modules/halaqah/halaqah.routes";

const app = express();
const API_V1 = "/api/v1";

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(generalLimiter);

// ── Health ────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, status: "ok", version: "2.0.0", timestamp: new Date().toISOString() });
});

// ── V1 Routes ─────────────────────────────────────────────────
app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/profile`, profileRoutes);
app.use(`${API_V1}/subjects`, subjectsRoutes);
app.use(`${API_V1}/tasks`, tasksRoutes);
app.use(`${API_V1}/projects`, projectsRoutes);
app.use(`${API_V1}/courses`, coursesRoutes);
app.use(`${API_V1}/finance`, financeRoutes);
app.use(`${API_V1}/habits`, habitsRoutes);
app.use(`${API_V1}/lifestyle`, lifestyleRoutes);
app.use(`${API_V1}/ai`, aiRoutes);
app.use(`${API_V1}/intelligence`, intelligenceRoutes);
// Islamic modules
app.use(`${API_V1}/salah`, salahRoutes);
app.use(`${API_V1}/quran`, quranRoutes);
app.use(`${API_V1}/adhkar`, adhkarRoutes);
app.use(`${API_V1}/score`, scoreRoutes);
app.use(`${API_V1}/fasting`, fastingRoutes);
app.use(`${API_V1}/halaqah`, halaqahRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found", code: "NOT_FOUND" });
});

// ── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`🚀 Itqan API v2 running on http://localhost:${config.port}`);
  console.log(`📡 AI: ${API_V1}/ai/[coach|plan-day|study-strategy|finance-insights]`);
  console.log(`📊 Intelligence: ${API_V1}/intelligence/dashboard`);
  console.log(`🕌 Salah: ${API_V1}/salah`);
  console.log(`📖 Quran: ${API_V1}/quran`);
  console.log(`📿 Adhkar: ${API_V1}/adhkar`);
  console.log(`⭐ Score: ${API_V1}/score`);
  console.log(`🌙 Fasting: ${API_V1}/fasting`);
  console.log(`🌍 Env: ${config.nodeEnv}`);
});

export default app;
