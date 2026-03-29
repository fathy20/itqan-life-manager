import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("subjects");

// GET /api/subjects
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("createdAt", "desc").get();
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// POST /api/subjects
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const ref = await col(req.uid!).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch {
    res.status(500).json({ error: "Failed to create subject" });
  }
});

// PUT /api/subjects/:id
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const ref = col(req.uid!).doc(req.params.id);
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    await ref.update(data);
    const updated = await ref.get();
    if (!updated.exists) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: updated.id, ...updated.data() });
  } catch {
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// DELETE /api/subjects/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

export default router;
