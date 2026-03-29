import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/profile
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db.collection("users").doc(req.uid!).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/profile
router.put("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const ref = db.collection("users").doc(req.uid!);
    await ref.set({ ...req.body, updatedAt: new Date().toISOString() }, { merge: true });
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
