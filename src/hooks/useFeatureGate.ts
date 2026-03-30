import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';

type Feature = 'aiCoach' | 'aiDailyPlan' | 'aiWeeklyReview' | 'aiStudyStrategy' | 'aiFinanceInsights' | 'advancedAnalytics' | 'dataExport' | 'focusStats';
type Plan = 'free' | 'pro' | 'premium';

const PLAN_FEATURES: Record<Plan, Feature[]> = {
  free: ['aiCoach'],
  pro: ['aiCoach', 'aiDailyPlan', 'aiWeeklyReview', 'advancedAnalytics', 'dataExport', 'focusStats'],
  premium: ['aiCoach', 'aiDailyPlan', 'aiWeeklyReview', 'aiStudyStrategy', 'aiFinanceInsights', 'advancedAnalytics', 'dataExport', 'focusStats'],
};

const FEATURE_REQUIRED_PLAN: Record<Feature, Plan> = {
  aiCoach: 'free',
  aiDailyPlan: 'pro',
  aiWeeklyReview: 'pro',
  advancedAnalytics: 'pro',
  dataExport: 'pro',
  focusStats: 'pro',
  aiStudyStrategy: 'premium',
  aiFinanceInsights: 'premium',
};

let cachedPlan: Plan | null = null;

async function fetchPlan(): Promise<Plan> {
  if (cachedPlan) return cachedPlan;
  try {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/subscription`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      cachedPlan = data.data?.planType || 'free';
      return cachedPlan!;
    }
  } catch {}
  return 'free';
}

export function useFeatureGate(feature: Feature) {
  const [plan, setPlan] = useState<Plan>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan().then(p => { setPlan(p); setLoading(false); });
  }, []);

  const canAccess = PLAN_FEATURES[plan]?.includes(feature) ?? false;
  const requiredPlan = FEATURE_REQUIRED_PLAN[feature];

  return { canAccess, requiredPlan, plan, loading };
}
