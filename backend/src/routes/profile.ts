import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, error } from "../shared/utils/response";

const router = Router();

const profileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.string().max(100).optional(),
  university: z.string().max(200).optional(),
  major: z.string().max(200).optional(),
  plan: z.enum(["free", "pro", "premium"]).optional(),
}).passthrough();

// GET /api/v1/profile
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db.collection("users").doc(req.uid!).get();
    if (!doc.exists) { error(res, 404, "Profile not found", "NOT_FOUND"); return; }
    ok(res, { id: doc.id, ...doc.data() });
  } catch {
    error(res, 500, "Failed to fetch profile", "SERVER_ERROR");
  }
});

// PUT /api/v1/profile
router.put("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const ref = db.collection("users").doc(req.uid!);
    await ref.set({ ...parsed.data, updatedAt: new Date().toISOString() }, { merge: true });
    const updated = await ref.get();
    ok(res, { id: updated.id, ...updated.data() });
  } catch {
    error(res, 500, "Failed to update profile", "SERVER_ERROR");
  }
});

export default router;
