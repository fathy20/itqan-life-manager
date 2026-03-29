import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("tasks");

// GET /api/tasks
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("createdAt", "desc").get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST /api/tasks
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const ref = await col(req.uid!).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PUT /api/tasks/:id
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const ref = col(req.uid!).doc(req.params.id);
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    await ref.update(data);
    const updated = await ref.get();
    if (!updated.exists) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: updated.id, ...updated.data() });
  } catch {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
