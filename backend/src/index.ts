import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

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

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/habits", habitsRoutes);
app.use("/api/lifestyle", lifestyleRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
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
  console.log(`Itqan backend running on http://localhost:${PORT}`);
});

export default app;
