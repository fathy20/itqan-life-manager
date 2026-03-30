import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { getUserPlan, checkFeatureAccess, checkAndIncrementAI } from "../modules/subscription/subscription.service";
import { PLANS, PlanType, planIncludes } from "../modules/subscription/plans.config";

export function requirePlan(required: PlanType) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const plan = await getUserPlan(req.uid!);
    if (!planIncludes(plan, required)) {
      res.status(403).json({ success: false, code: "PLAN_LIMIT", requiredPlan: required, currentPlan: plan, message: `This feature requires ${required} plan` });
      return;
    }
    next();
  };
}

export function requireFeature(feature: keyof typeof PLANS.free.features) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const allowed = await checkFeatureAccess(req.uid!, feature);
    if (!allowed) {
      res.status(403).json({ success: false, code: "PLAN_LIMIT", feature, message: `Upgrade your plan to access this feature` });
      return;
    }
    next();
  };
}

export async function checkAIUsage(req: AuthRequest, res: Response, next: NextFunction) {
  const result = await checkAndIncrementAI(req.uid!);
  if (!result.allowed) {
    res.status(429).json({ success: false, code: "AI_DAILY_LIMIT", plan: result.plan, message: "Daily AI limit reached. Upgrade for more." });
    return;
  }
  (req as any).aiRemaining = result.remaining;
  next();
}
