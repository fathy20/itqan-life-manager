import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, error } from "../shared/utils/response";

const router = Router();

// GET /api/v1/auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.uid!;
    const profileDoc = await db.collection("users").doc(uid).get();

    if (!profileDoc.exists) {
      error(res, 404, "User profile not found", "NOT_FOUND");
      return;
    }

    ok(res, { uid, ...profileDoc.data() });
  } catch {
    error(res, 500, "Failed to fetch user", "SERVER_ERROR");
  }
});

export default router;
