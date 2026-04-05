import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { ok, error } from "../../shared/utils/response";
import { getUserPlan, ensureSubscriptionDoc } from "./subscription.service";
import { PLANS, PlanType } from "./plans.config";
import { db } from "../../lib/firebase-admin";

const router = Router();

// GET /api/v1/subscription — returns the caller's plan + limits + today's usage
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.uid!;
    await ensureSubscriptionDoc(uid);
    const planType = await getUserPlan(uid);
    const plan = PLANS[planType];

    // usage
    const usageSnap = await db.collection("users").doc(uid).collection("meta").doc("usage").get();
    const today = new Date().toISOString().split("T")[0];
    const usage = usageSnap.exists ? usageSnap.data() : null;
    const aiRequestsToday = usage && usage.resetDate === today ? usage.aiRequestsToday || 0 : 0;

    ok(res, {
      planType,
      limits: plan,
      usage: {
        aiRequestsToday,
        aiRequestsRemaining: plan.aiRequestsPerDay === -1 ? -1 : Math.max(0, plan.aiRequestsPerDay - aiRequestsToday),
        resetDate: today,
      },
    });
  } catch {
    error(res, 500, "Failed to fetch subscription", "SERVER_ERROR");
  }
});

// GET /api/v1/subscription/plans — public list of plans (still auth-gated for consistency)
router.get("/plans", authMiddleware, async (_req: AuthRequest, res: Response) => {
  ok(res, PLANS);
});

// POST /api/v1/subscription — upgrade/downgrade (dev-only; production must be driven by payment webhooks)
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { planType } = req.body as { planType?: PlanType };
    if (!planType || !(planType in PLANS)) {
      error(res, 400, "Invalid planType", "VALIDATION_ERROR");
      return;
    }
    const ref = db.collection("users").doc(req.uid!).collection("meta").doc("subscription");
    await ref.set(
      { planType, status: "active", updatedAt: new Date().toISOString() },
      { merge: true }
    );
    ok(res, { planType });
  } catch {
    error(res, 500, "Failed to update subscription", "SERVER_ERROR");
  }
});

export default router;
