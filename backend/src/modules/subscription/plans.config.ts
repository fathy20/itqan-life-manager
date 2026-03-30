export type PlanType = "free" | "pro" | "premium";

export interface PlanLimits {
  aiRequestsPerDay: number; // -1 = unlimited
  maxHabits: number;        // -1 = unlimited
  features: {
    aiCoach: boolean;
    aiDailyPlan: boolean;
    aiWeeklyReview: boolean;
    aiStudyStrategy: boolean;
    aiFinanceInsights: boolean;
    advancedAnalytics: boolean;
    dataExport: boolean;
    focusStats: boolean;
  };
}

export const PLANS: Record<PlanType, PlanLimits> = {
  free: {
    aiRequestsPerDay: 5,
    maxHabits: 5,
    features: {
      aiCoach: true,
      aiDailyPlan: false,
      aiWeeklyReview: false,
      aiStudyStrategy: false,
      aiFinanceInsights: false,
      advancedAnalytics: false,
      dataExport: false,
      focusStats: false,
    },
  },
  pro: {
    aiRequestsPerDay: 30,
    maxHabits: -1,
    features: {
      aiCoach: true,
      aiDailyPlan: true,
      aiWeeklyReview: true,
      aiStudyStrategy: false,
      aiFinanceInsights: false,
      advancedAnalytics: true,
      dataExport: true,
      focusStats: true,
    },
  },
  premium: {
    aiRequestsPerDay: -1,
    maxHabits: -1,
    features: {
      aiCoach: true,
      aiDailyPlan: true,
      aiWeeklyReview: true,
      aiStudyStrategy: true,
      aiFinanceInsights: true,
      advancedAnalytics: true,
      dataExport: true,
      focusStats: true,
    },
  },
} as const;

export const PLAN_HIERARCHY: Record<PlanType, number> = { free: 0, pro: 1, premium: 2 };

export function planIncludes(userPlan: PlanType, requiredPlan: PlanType): boolean {
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
}
