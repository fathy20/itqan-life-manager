import { useState, useEffect, useCallback } from 'react';
import { quranApi } from '../lib/api';

export function useQuran() {
  const [plans, setPlans] = useState<any[]>([]);
  const [hifz, setHifz] = useState<any[]>([]);
  const [reviewsDue, setReviewsDue] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ weeklyPages: 0, totalMemorized: 0, reviewsDue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [plansRes, hifzRes, reviewsRes, statsRes] = await Promise.all([
      quranApi.getPlans(),
      quranApi.getHifz(),
      quranApi.getReviewsDue(),
      quranApi.getStats(),
    ]);
    const p = plansRes as any, h = hifzRes as any, r = reviewsRes as any, s = statsRes as any;
    if (p?.success) setPlans(p.data || []);
    if (h?.success) setHifz(h.data || []);
    if (r?.success) setReviewsDue(r.data || []);
    if (s?.success) setStats(s.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const logSession = async (data: any) => {
    const res = await quranApi.logSession(data);
    if (res.success) fetchAll();
    return res;
  };

  const updateHifz = async (surahNum: number, data: any) => {
    const res = await quranApi.updateHifz(surahNum, data);
    if (res.success) fetchAll();
    return res;
  };

  const createPlan = async (data: any) => {
    const res = await quranApi.createPlan(data);
    if (res.success) fetchAll();
    return res;
  };

  const activePlan = plans.find((p: any) => p.status === 'active');

  return { plans, activePlan, hifz, reviewsDue, stats, loading, logSession, updateHifz, createPlan };
}
