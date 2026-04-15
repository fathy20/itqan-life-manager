// ═══════════════════════════════════════════════════════════════
//  backend/src/routes/projects.ts
//  Projects Routes — aligned with new interface (types/new.ts)
//  Changes from old:
//    - removed: type ('work'|'freelance'), priority, color
//    - added: deadline, progress (number 0-100)
//    - status changed: 'ongoing'→'active', 'on-hold'→'paused'
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

const col = (uid: string) => db.collection("users").doc(uid).collection("projects");

// ─── Schemas ─────────────────────────────────────────────────

const createProjectSchema = z.object({
  name: z.string().min(1).max(300),
  client: z.string().max(200).optional(),
  deadline: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(["active", "completed", "paused"]).default("active"),
});

const updateProjectSchema = createProjectSchema.partial();

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/projects
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await col(req.uid!).orderBy("createdAt", "desc").get();
    ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    error(res, 500, "Failed to fetch projects", "SERVER_ERROR");
  }
});

// POST /api/v1/projects
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const now = new Date().toISOString();
    const data = { ...parsed.data, createdAt: now, updatedAt: now };
    const ref = await col(req.uid!).add(data);
    created(res, { id: ref.id, ...data });
  } catch {
    error(res, 500, "Failed to create project", "SERVER_ERROR");
  }
});

// PUT /api/v1/projects/:id
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
      return;
    }
    const ref = col(req.uid!).doc(req.params.id);
    const data = { ...parsed.data, updatedAt: new Date().toISOString() };
    await ref.update(data);
    const updated = await ref.get();
    if (!updated.exists) { error(res, 404, "Project not found", "NOT_FOUND"); return; }
    ok(res, { id: updated.id, ...updated.data() });
  } catch {
    error(res, 500, "Failed to update project", "SERVER_ERROR");
  }
});

// DELETE /api/v1/projects/:id
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await col(req.uid!).doc(req.params.id).delete();
    noContent(res);
  } catch {
    error(res, 500, "Failed to delete project", "SERVER_ERROR");
  }
});

export default router;
