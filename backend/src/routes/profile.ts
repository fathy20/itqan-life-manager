// ═══════════════════════════════════════════════════════════════
//  backend/src/routes/profile.ts
//  Profile Routes — aligned with new interface (types/new.ts)
//  Changes from old:
//    - name → displayName
//    - removed: faculty, program, level, semester, major
//    - added: email, onboardingCompleted, financePIN, language,
//             location, prayerMethod, madhab, createdAt, updatedAt
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, error } from "../shared/utils/response";

const router = Router();

const profileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["student", "employee", "freelancer"]).optional(),
  university: z.string().max(200).optional(),
  onboardingCompleted: z.boolean().optional(),
  financePIN: z.string().max(6).optional(),
  language: z.enum(["ar", "en"]).optional(),
  timezone: z.string().max(100).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    city: z.string().max(200),
  }).optional(),
  prayerMethod: z.number().int().min(0).max(15).optional(),
  madhab: z.enum(["hanafi", "maliki", "shafii", "hanbali"]).optional(),
}).passthrough();

// GET /api/v1/profile
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db.collection("users").doc(req.uid!).get();
    if (!doc.exists) { error(res, 404, "Profile not found", "NOT_FOUND"); return; }
    ok(res, { uid: doc.id, ...doc.data() });
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
    ok(res, { uid: updated.id, ...updated.data() });
  } catch {
    error(res, 500, "Failed to update profile", "SERVER_ERROR");
  }
});

export default router;
