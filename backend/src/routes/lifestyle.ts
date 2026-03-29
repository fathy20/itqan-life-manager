import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("lifestyle_logs");

// GET /api/lifestyle
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("date", "desc").get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: "Failed to fetch lifestyle logs" });
  }
});

// POST /api/lifestyle
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { date, ...rest } = req.body;
    if (!date) { res.status(400).json({ error: "date is required" }); return; }
    const data = { date, ...rest, updatedAt: new Date().toISOString() };
    // Use date as document ID so each day has one log
    await col(req.uid!).doc(date).set(data, { merge: true });
    res.status(201).json({ id: date, ...data });
  } catch {
    res.status(500).json({ error: "Failed to create lifestyle log" });
  }
});

// PUT /api/lifestyle/:id  (id = date string e.g. 2024-01-15)
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const ref = col(req.uid!).doc(req.params.id);
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    await ref.set(data, { merge: true });
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch {
    res.status(500).json({ error: "Failed to update lifestyle log" });
  }
});

// DELETE /api/lifestyle/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete lifestyle log" });
  }
});

export default router;
