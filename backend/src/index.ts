import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import subjectsRoutes from "./routes/subjects";
import tasksRoutes from "./routes/tasks";
import projectsRoutes from "./routes/projects";
import coursesRoutes from "./routes/courses";
import financeRoutes from "./routes/finance";
import habitsRoutes from "./routes/habits";
import lifestyleRoutes from "./routes/lifestyle";

const app = express();
const PORT = process.env.PORT || 5000;
const API_V1 = "/api/v1";

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: "Too many requests" } });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() });
});

// ── V1 Routes ─────────────────────────────────────────────────────────────────
app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/profile`, profileRoutes);
app.use(`${API_V1}/subjects`, subjectsRoutes);
app.use(`${API_V1}/tasks`, tasksRoutes);
app.use(`${API_V1}/projects`, projectsRoutes);
app.use(`${API_V1}/courses`, coursesRoutes);
app.use(`${API_V1}/finance`, financeRoutes);
app.use(`${API_V1}/habits`, habitsRoutes);
app.use(`${API_V1}/lifestyle`, lifestyleRoutes);

// ── Legacy support (redirect /api/* → /api/v1/*) ──────────────────────────────
app.use("/api/", (req: Request, res: Response) => {
  res.redirect(301, `/api/v1${req.path}`);
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Itqan API v1 running on http://localhost:${PORT}`);
  console.log(`📡 Routes: ${API_V1}/[subjects|tasks|projects|courses|finance|habits|lifestyle|profile]`);
});

export default app;
