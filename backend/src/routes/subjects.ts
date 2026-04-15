// ═══════════════════════════════════════════════════════════════
//  backend/src/routes/subjects.ts
//  Subjects Routes — aligned with new interface (types/new.ts)
//  Changes from old:
//    - difficulty: number (1-5) instead of "easy"|"medium"|"hard"
//    - removed: color, carryover, isPending, examTime
//    - added: nameAr, notes, createdAt, updatedAt
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("subjects");

// ─── Schemas ─────────────────────────────────────────────────

const createSubjectSchema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().max(200).optional(),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  difficulty: z.number().int().min(1).max(5),
  totalLectures: z.number().int().min(0),
  completedLectures: z.number().int().min(0).default(0),
  notes: z.string().max(2000).optional(),
});

const updateSubjectSchema = createSubjectSchema.partial();

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/subjects
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("createdAt", "desc").get();
    ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    error(res, 500, "Failed to fetch subjects", "SERVER_ERROR");
  }
});

// POST /api/v1/subjects
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createSubjectSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const now = new Date().toISOString();
    const data = { ...parsed.data, createdAt: now, updatedAt: now };
    const ref = await col(req.uid!).add(data);
    created(res, { id: ref.id, ...data });
  } catch {
    error(res, 500, "Failed to create subject", "SERVER_ERROR");
  }
});

// PUT /api/v1/subjects/:id
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateSubjectSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const ref = col(req.uid!).doc(req.params.id);
    const data = { ...parsed.data, updatedAt: new Date().toISOString() };
    await ref.update(data);
    const updated = await ref.get();
    if (!updated.exists) { error(res, 404, "Subject not found", "NOT_FOUND"); return; }
    ok(res, { id: updated.id, ...updated.data() });
  } catch {
    error(res, 500, "Failed to update subject", "SERVER_ERROR");
  }
});

// DELETE /api/v1/subjects/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    noContent(res);
  } catch {
    error(res, 500, "Failed to delete subject", "SERVER_ERROR");
  }
});

export default router;
