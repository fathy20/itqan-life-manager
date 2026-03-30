// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/score/score.routes.ts
//  Score Routes — Daily life score endpoints
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { ok, error } from "../../shared/utils/response";
import * as scoreService from "./score.service";

const router = Router();
router.use(authMiddleware);

// GET /api/v1/score/today — computes if not exists
router.get("/today", async (req: AuthRequest, res: Response) => {
  try {
    const score = await scoreService.getToday(req.uid!);
    ok(res, score);
  } catch (err: any) {
    error(res, 500, err.message, "SCORE_ERROR");
  }
});

// GET /api/v1/score/week — last 7 days
router.get("/week", async (req: AuthRequest, res: Response) => {
  try {
    const scores = await scoreService.getWeek(req.uid!);
    ok(res, scores);
  } catch (err: any) {
    error(res, 500, err.message, "SCORE_ERROR");
  }
});

// GET /api/v1/score/shared — weekly ring, rank, streak
router.get("/shared", async (req: AuthRequest, res: Response) => {
  try {
    const shared = await scoreService.getShared(req.uid!);
    ok(res, shared);
  } catch (err: any) {
    error(res, 500, err.message, "SCORE_ERROR");
  }
});

// POST /api/v1/score/compute — force recompute today
router.post("/compute", async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const score = await scoreService.computeScore(req.uid!, today);
    ok(res, score, "Score recomputed");
  } catch (err: any) {
    error(res, 500, err.message, "COMPUTE_ERROR");
  }
});

export default router;
