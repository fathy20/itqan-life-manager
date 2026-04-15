// ═══════════════════════════════════════════════════════════════
//  backend/src/routes/habits.ts
//  Habits Routes — aligned with new interface (types/new.ts)
//  Changes from old:
//    - removed: category, frequency, streak (streak computed client-side)
//    - added: nameAr, createdAt, updatedAt
//    - completedDates remains as string[]
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("habits");

// ─── Schemas ─────────────────────────────────────────────────

const createHabitSchema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().max(200).optional(),
  icon: z.string().max(50).optional(),
  completedDates: z.array(z.string()).default([]),
});

const updateHabitSchema = createHabitSchema.partial();

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/habits
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("createdAt", "desc").get();
    ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    error(res, 500, "Failed to fetch habits", "SERVER_ERROR");
  }
});

// POST /api/v1/habits
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createHabitSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const now = new Date().toISOString();
    const data = { ...parsed.data, createdAt: now, updatedAt: now };
    const ref = await col(req.uid!).add(data);
    created(res, { id: ref.id, ...data });
  } catch {
    error(res, 500, "Failed to create habit", "SERVER_ERROR");
  }
});

// PUT /api/v1/habits/:id
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateHabitSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const ref = col(req.uid!).doc(req.params.id);
    const data = { ...parsed.data, updatedAt: new Date().toISOString() };
    await ref.update(data);
    const updated = await ref.get();
    if (!updated.exists) { error(res, 404, "Habit not found", "NOT_FOUND"); return; }
    ok(res, { id: updated.id, ...updated.data() });
  } catch {
    error(res, 500, "Failed to update habit", "SERVER_ERROR");
  }
});

// DELETE /api/v1/habits/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    noContent(res);
  } catch {
    error(res, 500, "Failed to delete habit", "SERVER_ERROR");
  }
});

export default router;
