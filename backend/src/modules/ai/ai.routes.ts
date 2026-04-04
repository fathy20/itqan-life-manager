import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { aiLimiter } from "../../middleware/rateLimiter";
import { chat, planDay, weeklyReview } from "./ai.service";
import { ok, error } from "../../shared/utils/response";

const router = Router();

// POST /api/v1/ai/coach
router.post("/coach", authMiddleware, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) { error(res, 400, "Message is required", "VALIDATION_ERROR"); return; }
    const reply = await chat(req.uid!, message, history);
    ok(res, { reply });
  } catch (err: any) {
    console.error("AI coach error:", err.message);
    error(res, 500, "حدث خطأ في الذكاء الاصطناعي. حاول مرة أخرى.", "AI_ERROR");
  }
});

// POST /api/v1/ai/plan-day
router.post("/plan-day", authMiddleware, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await planDay(req.uid!);
    ok(res, plan);
  } catch (err: any) {
    error(res, 500, "Failed to generate daily plan", "AI_ERROR");
  }
});

// POST /api/v1/ai/weekly-review
router.post("/weekly-review", authMiddleware, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const review = await weeklyReview(req.uid!);
    ok(res, review);
  } catch (err: any) {
    error(res, 500, "Failed to generate weekly review", "AI_ERROR");
  }
});

export default router;
