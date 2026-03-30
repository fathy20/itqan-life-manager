import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { computeIntelligence } from "./intelligence.service";
import { ok, error } from "../../shared/utils/response";

const router = Router();

// GET /api/v1/intelligence/dashboard
router.get("/dashboard", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const report = await computeIntelligence(req.uid!);
    ok(res, report);
  } catch (err: any) {
    console.error("Intelligence error:", err);
    error(res, 500, "Failed to compute intelligence", "SERVER_ERROR");
  }
});

export default router;
