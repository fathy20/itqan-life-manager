import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/auth/me - get current user profile
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.uid!;
    const profileDoc = await db.collection("users").doc(uid).get();

    if (!profileDoc.exists) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }

    res.json({ uid, ...profileDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
