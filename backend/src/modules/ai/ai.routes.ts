import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { requireFeature, checkAIUsage } from "../../middleware/planGate";
import { aiLimiter } from "../../middleware/rateLimiter";
import { coachChat, planDay, studyStrategy, financeInsights } from "./ai.service";
import { ok, error } from "../../shared/utils/response";

const router = Router();

// POST /api/v1/ai/coach — All plans (usage limited)
router.post("/coach", authMiddleware, aiLimiter, checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) { error(res, 400, "Message is required", "VALIDATION_ERROR"); return; }
    const text = await coachChat(req.uid!, message, history);
    ok(res, { text, remaining: (req as any).aiRemaining });
  } catch (err: any) {
    console.error("Coach error:", err);
    error(res, 500, "حدث خطأ في الذكاء الاصطناعي", "AI_ERROR");
  }
});

// POST /api/v1/ai/plan-day — Pro+
router.post("/plan-day", authMiddleware, aiLimiter, requireFeature("aiDailyPlan"), checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await planDay(req.uid!);
    ok(res, plan);
  } catch (err: any) {
    error(res, 500, "Failed to generate daily plan", "AI_ERROR");
  }
});

// POST /api/v1/ai/study-strategy — Premium
router.post("/study-strategy", authMiddleware, aiLimiter, requireFeature("aiStudyStrategy"), checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const strategy = await studyStrategy(req.uid!);
    ok(res, strategy);
  } catch (err: any) {
    error(res, 500, "Failed to generate study strategy", "AI_ERROR");
  }
});

// POST /api/v1/ai/finance-insights — Premium
router.post("/finance-insights", authMiddleware, aiLimiter, requireFeature("aiFinanceInsights"), checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const insights = await financeInsights(req.uid!);
    ok(res, insights);
  } catch (err: any) {
    error(res, 500, "Failed to generate finance insights", "AI_ERROR");
  }
});

export default router;
