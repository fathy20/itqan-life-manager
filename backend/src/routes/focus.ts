// ═══════════════════════════════════════════════════════════════
//  backend/src/routes/focus.ts
//  Focus Sessions Routes — aligned with new interface (types/new.ts)
//  Changes from old:
//    - durationMinutes → duration
//    - type: 'pomodoro'|'deep-work' → 'study'|'work'|'quran'|'other'
//    - startTime → completedAt
//    - taskId → linkedTaskId
//    - added: label
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("focus_sessions");

// ─── Schemas ─────────────────────────────────────────────────

const createFocusSchema = z.object({
  duration: z.number().positive(),
  type: z.enum(["study", "work", "quran", "other"]),
  label: z.string().max(200).optional(),
  completedAt: z.string().optional(),
  linkedTaskId: z.string().optional(),
});

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/focus
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("createdAt", "desc").limit(50).get();
    ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    error(res, 500, "Failed to fetch focus sessions", "SERVER_ERROR");
  }
});

// POST /api/v1/focus
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createFocusSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const now = new Date().toISOString();
    const data = {
      ...parsed.data,
      completedAt: parsed.data.completedAt || now,
      createdAt: now,
    };
    const ref = await col(req.uid!).add(data);
    created(res, { id: ref.id, ...data });
  } catch {
    error(res, 500, "Failed to create focus session", "SERVER_ERROR");
  }
});

// DELETE /api/v1/focus/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    noContent(res);
  } catch {
    error(res, 500, "Failed to delete focus session", "SERVER_ERROR");
  }
});

export default router;
