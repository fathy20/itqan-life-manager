import { db } from "../../lib/firebase-admin";
import { PlanType, PLANS, planIncludes } from "./plans.config";
import { FieldValue } from "firebase-admin/firestore";

export async function getUserPlan(uid: string): Promise<PlanType> {
  const snap = await db.collection("users").doc(uid).collection("meta").doc("subscription").get();
  if (!snap.exists) return "free";
  return (snap.data()?.planType as PlanType) || "free";
}

export async function checkFeatureAccess(uid: string, feature: keyof typeof PLANS.free.features): Promise<boolean> {
  const plan = await getUserPlan(uid);
  return PLANS[plan].features[feature];
}

export async function checkAndIncrementAI(uid: string): Promise<{ allowed: boolean; remaining: number; plan: PlanType }> {
  const plan = await getUserPlan(uid);
  const limit = PLANS[plan].aiRequestsPerDay;
  if (limit === -1) return { allowed: true, remaining: -1, plan };

  const usageRef = db.collection("users").doc(uid).collection("meta").doc("usage");
  const snap = await usageRef.get();
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  if (!snap.exists || snap.data()?.resetDate !== today) {
    await usageRef.set({ aiRequestsToday: 1, resetDate: today, updatedAt: now.toISOString() });
    return { allowed: true, remaining: limit - 1, plan };
  }

  const used = snap.data()?.aiRequestsToday || 0;
  if (used >= limit) return { allowed: false, remaining: 0, plan };

  await usageRef.update({ aiRequestsToday: FieldValue.increment(1), updatedAt: now.toISOString() });
  return { allowed: true, remaining: limit - used - 1, plan };
}

export async function ensureSubscriptionDoc(uid: string): Promise<void> {
  const ref = db.collection("users").doc(uid).collection("meta").doc("subscription");
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ planType: "free", status: "active", createdAt: new Date().toISOString() });
  }
}
