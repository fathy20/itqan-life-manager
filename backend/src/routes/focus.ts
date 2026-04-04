import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("focus_sessions");

// GET /api/v1/focus
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("createdAt", "desc").limit(50).get();
    ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    error(res, 500, "Failed to fetch focus sessions", "SERVER_ERROR");
  }
});

// POST /api/v1/focus
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { duration, type, label } = req.body;
    if (typeof duration !== "number" || duration <= 0) {
      error(res, 400, "duration must be a positive number", "VALIDATION_ERROR");
      return;
    }
    const data = {
      duration,
      type: type || "focus",
      label: label || "",
      createdAt: new Date().toISOString(),
    };
    const ref = await col(req.uid!).add(data);
    created(res, { id: ref.id, ...data });
  } catch {
    error(res, 500, "Failed to create focus session", "SERVER_ERROR");
  }
});

// DELETE /api/v1/focus/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    noContent(res);
  } catch {
    error(res, 500, "Failed to delete focus session", "SERVER_ERROR");
  }
});

export default router;
