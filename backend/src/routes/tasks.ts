// ═══════════════════════════════════════════════════════════════
//  backend/src/routes/tasks.ts
//  Tasks Routes — aligned with new interface (types/new.ts)
//  Changes from old:
//    - type: added 'job','worship','health' — removed 'work'→'job'
//    - replaced priority+status with: completed (boolean) + focusLevel
//    - removed: description, notes, dueDate, estimatedMinutes
//    - added: focusLevel, createdAt, updatedAt
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("tasks");

// ─── Schemas ─────────────────────────────────────────────────

const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  type: z.enum(["job", "freelance", "study", "personal", "worship", "health"]),
  focusLevel: z.enum(["deep", "medium", "light"]),
  completed: z.boolean().default(false),
  completedAt: z.string().optional(),
  deadline: z.string().optional(),
  projectId: z.string().optional(),
});

const updateTaskSchema = createTaskSchema.partial();

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/tasks
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("createdAt", "desc").get();
    ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    error(res, 500, "Failed to fetch tasks", "SERVER_ERROR");
  }
});

// POST /api/v1/tasks
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const now = new Date().toISOString();
    const data = { ...parsed.data, createdAt: now, updatedAt: now };
    const ref = await col(req.uid!).add(data);
    created(res, { id: ref.id, ...data });
  } catch {
    error(res, 500, "Failed to create task", "SERVER_ERROR");
  }
});

// PUT /api/v1/tasks/:id
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const ref = col(req.uid!).doc(req.params.id);
    // Auto-set completedAt when marking as completed
    const updates: Record<string, any> = { ...parsed.data, updatedAt: new Date().toISOString() };
    if (parsed.data.completed === true && !parsed.data.completedAt) {
      updates.completedAt = new Date().toISOString();
    }
    await ref.update(updates);
    const updated = await ref.get();
    if (!updated.exists) { error(res, 404, "Task not found", "NOT_FOUND"); return; }
    ok(res, { id: updated.id, ...updated.data() });
  } catch {
    error(res, 500, "Failed to update task", "SERVER_ERROR");
  }
});

// DELETE /api/v1/tasks/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    noContent(res);
  } catch {
    error(res, 500, "Failed to delete task", "SERVER_ERROR");
  }
});

export default router;
