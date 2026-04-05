import { describe, it, expect } from "vitest";
import { PLANS, PLAN_HIERARCHY, planIncludes, PlanType } from "../modules/subscription/plans.config";

describe("PLANS config", () => {
  it("defines all three plan tiers", () => {
    expect(Object.keys(PLANS)).toEqual(["free", "pro", "premium"]);
  });

  it("free plan has strict AI limit and limited features", () => {
    expect(PLANS.free.aiRequestsPerDay).toBe(5);
    expect(PLANS.free.maxHabits).toBe(5);
    expect(PLANS.free.features.aiCoach).toBe(true);
    expect(PLANS.free.features.aiDailyPlan).toBe(false);
    expect(PLANS.free.features.advancedAnalytics).toBe(false);
  });

  it("pro plan unlocks daily plan, weekly review, analytics", () => {
    expect(PLANS.pro.features.aiDailyPlan).toBe(true);
    expect(PLANS.pro.features.aiWeeklyReview).toBe(true);
    expect(PLANS.pro.features.advancedAnalytics).toBe(true);
    expect(PLANS.pro.features.dataExport).toBe(true);
    expect(PLANS.pro.maxHabits).toBe(-1);
  });

  it("premium plan unlocks all features with unlimited AI", () => {
    expect(PLANS.premium.aiRequestsPerDay).toBe(-1);
    for (const key of Object.keys(PLANS.premium.features) as Array<keyof typeof PLANS.premium.features>) {
      expect(PLANS.premium.features[key]).toBe(true);
    }
  });

  it("each tier is strictly >= the one below in features", () => {
    const tiers: PlanType[] = ["free", "pro", "premium"];
    for (let i = 1; i < tiers.length; i++) {
      for (const key of Object.keys(PLANS.free.features) as Array<keyof typeof PLANS.free.features>) {
        const lower = PLANS[tiers[i - 1]].features[key];
        const higher = PLANS[tiers[i]].features[key];
        // If lower has access, higher must also have access
        if (lower) expect(higher).toBe(true);
      }
    }
  });
});

describe("planIncludes()", () => {
  it("returns true when user plan is at or above required", () => {
    expect(planIncludes("premium", "free")).toBe(true);
    expect(planIncludes("premium", "pro")).toBe(true);
    expect(planIncludes("premium", "premium")).toBe(true);
    expect(planIncludes("pro", "free")).toBe(true);
    expect(planIncludes("pro", "pro")).toBe(true);
    expect(planIncludes("free", "free")).toBe(true);
  });

  it("returns false when user plan is below required", () => {
    expect(planIncludes("free", "pro")).toBe(false);
    expect(planIncludes("free", "premium")).toBe(false);
    expect(planIncludes("pro", "premium")).toBe(false);
  });
});

describe("PLAN_HIERARCHY", () => {
  it("orders tiers correctly", () => {
    expect(PLAN_HIERARCHY.free).toBeLessThan(PLAN_HIERARCHY.pro);
    expect(PLAN_HIERARCHY.pro).toBeLessThan(PLAN_HIERARCHY.premium);
  });
});
