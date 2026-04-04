import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("lifestyle_logs");

// GET /api/v1/lifestyle
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("date", "desc").get();
    ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    error(res, 500, "Failed to fetch lifestyle logs", "SERVER_ERROR");
  }
});

// POST /api/v1/lifestyle
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { date, ...rest } = req.body;
    if (!date) { error(res, 400, "date is required", "VALIDATION_ERROR"); return; }
    const data = { date, ...rest, updatedAt: new Date().toISOString() };
    await col(req.uid!).doc(date).set(data, { merge: true });
    created(res, { id: date, ...data });
  } catch {
    error(res, 500, "Failed to create lifestyle log", "SERVER_ERROR");
  }
});

// PUT /api/v1/lifestyle/:id  (id = date string e.g. 2024-01-15)
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const ref = col(req.uid!).doc(req.params.id);
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    await ref.set(data, { merge: true });
    const updated = await ref.get();
    ok(res, { id: updated.id, ...updated.data() });
  } catch {
    error(res, 500, "Failed to update lifestyle log", "SERVER_ERROR");
  }
});

// DELETE /api/v1/lifestyle/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    noContent(res);
  } catch {
    error(res, 500, "Failed to delete lifestyle log", "SERVER_ERROR");
  }
});

export default router;
