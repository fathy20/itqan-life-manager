// ═══════════════════════════════════════════════════════════════
//  backend/src/routes/courses.ts
//  Courses Routes — aligned with new interface (types/new.ts)
//  Changes from old:
//    - totalHours/completedHours → totalLessons/completedLessons
//    - removed: weeklyGoalHours, color
//    - added: progress (number 0-100), status
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("courses");

// ─── Schemas ─────────────────────────────────────────────────

const createCourseSchema = z.object({
  name: z.string().min(1).max(300),
  platform: z.string().max(200).optional(),
  totalLessons: z.number().int().min(0),
  completedLessons: z.number().int().min(0).default(0),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(["active", "completed", "paused"]).default("active"),
});

const updateCourseSchema = createCourseSchema.partial();

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/courses
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("createdAt", "desc").get();
    ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    error(res, 500, "Failed to fetch courses", "SERVER_ERROR");
  }
});

// POST /api/v1/courses
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const now = new Date().toISOString();
    // Auto-calculate progress if not provided
    const progress = parsed.data.totalLessons > 0
      ? Math.round((parsed.data.completedLessons / parsed.data.totalLessons) * 100)
      : parsed.data.progress;
    const data = { ...parsed.data, progress, createdAt: now, updatedAt: now };
    const ref = await col(req.uid!).add(data);
    created(res, { id: ref.id, ...data });
  } catch {
    error(res, 500, "Failed to create course", "SERVER_ERROR");
  }
});

// PUT /api/v1/courses/:id
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const ref = col(req.uid!).doc(req.params.id);
    const updates: Record<string, any> = { ...parsed.data, updatedAt: new Date().toISOString() };
    // Auto-calculate progress when lessons change
    if (parsed.data.completedLessons !== undefined || parsed.data.totalLessons !== undefined) {
      const doc = await ref.get();
      if (doc.exists) {
        const existing = doc.data()!;
        const total = parsed.data.totalLessons ?? existing.totalLessons ?? 0;
        const completed = parsed.data.completedLessons ?? existing.completedLessons ?? 0;
        if (total > 0) updates.progress = Math.round((completed / total) * 100);
      }
    }
    await ref.update(updates);
    const updated = await ref.get();
    if (!updated.exists) { error(res, 404, "Course not found", "NOT_FOUND"); return; }
    ok(res, { id: updated.id, ...updated.data() });
  } catch {
    error(res, 500, "Failed to update course", "SERVER_ERROR");
  }
});

// DELETE /api/v1/courses/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    noContent(res);
  } catch {
    error(res, 500, "Failed to delete course", "SERVER_ERROR");
  }
});

export default router;
