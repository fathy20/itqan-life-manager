// ═══════════════════════════════════════════════════════════════
//  backend/src/routes/lifestyle.ts
//  Lifestyle Routes — aligned with new interface (types/new.ts)
//  Changes from old:
//    - phoneUsageMinutes → phoneHours
//    - waterIntake (glasses) → waterLiters
//    - removed: wakeUpTime, phonePickups
//    - added: exercise { type, durationMinutes }
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("lifestyle_logs");

// ─── Schemas ─────────────────────────────────────────────────

const lifestyleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sleepHours: z.number().min(0).max(24),
  phoneHours: z.number().min(0).max(24),
  waterLiters: z.number().min(0).max(20),
  steps: z.number().int().min(0),
  exercise: z.object({
    type: z.string().min(1).max(100),
    durationMinutes: z.number().int().min(0),
  }).optional(),
});

const updateLifestyleSchema = lifestyleSchema.partial().extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/lifestyle
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("date", "desc").get();
    ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    error(res, 500, "Failed to fetch lifestyle logs", "SERVER_ERROR");
  }
});

// POST /api/v1/lifestyle
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = lifestyleSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const now = new Date().toISOString();
    const data = { ...parsed.data, createdAt: now };
    // Use date as doc ID for upsert-style writes
    await col(req.uid!).doc(parsed.data.date).set(data, { merge: true });
    created(res, { id: parsed.data.date, ...data });
  } catch {
    error(res, 500, "Failed to create lifestyle log", "SERVER_ERROR");
  }
});

// PUT /api/v1/lifestyle/:id  (id = date string e.g. 2024-01-15)
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateLifestyleSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const ref = col(req.uid!).doc(req.params.id);
    const data = { ...parsed.data, updatedAt: new Date().toISOString() };
    await ref.set(data, { merge: true });
    const updated = await ref.get();
    ok(res, { id: updated.id, ...updated.data() });
  } catch {
    error(res, 500, "Failed to update lifestyle log", "SERVER_ERROR");
  }
});

// DELETE /api/v1/lifestyle/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    noContent(res);
  } catch {
    error(res, 500, "Failed to delete lifestyle log", "SERVER_ERROR");
  }
});

export default router;
