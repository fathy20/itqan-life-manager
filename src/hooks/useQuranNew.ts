// ═══════════════════════════════════════════════════════════════
//  src/hooks/useQuranNew.ts
//  NEW Quran hook — Phase 1
//  Part of Quran vertical slice
//  DO NOT use in legacy screens
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { quranApiNew } from '../lib/api/index';
import type { KhatmaPlan, QuranSession, SurahHifz } from '../types/new';

export interface UseQuranReturn {
  // Data
  activePlan:  KhatmaPlan  | null;
  hifz:        SurahHifz[];
  reviewsDue:  SurahHifz[];
  stats:       { weeklyPages: number; totalMemorized: number; reviewsDue: number } | null;
  todayPages:  number;  // pages logged today (derived from sessions)

  // States
  loading:  boolean;
  error:    string | null;

  // Actions
  logSession: (data: {
    type: 'reading' | 'hifz' | 'review';
    pages?: number;
    surah?: number;
    date: string;
  }) => Promise<void>;
  updateHifz: (surahNum: number, data: {
    memorizedAyahs?: number;
    status?: SurahHifz['status'];
    nextReviewDate?: string;
  }) => Promise<void>;
  createPlan: (data: { targetDays: number; dailyPages: number }) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useQuranNew(): UseQuranReturn {
  const today = new Date().toISOString().split('T')[0];

  const [activePlan,  setActivePlan]  = useState<KhatmaPlan | null>(null);
  const [hifz,        setHifz]        = useState<SurahHifz[]>([]);
  const [reviewsDue,  setReviewsDue]  = useState<SurahHifz[]>([]);
  const [stats,       setStats]       = useState<{ weeklyPages: number; totalMemorized: number; reviewsDue: number } | null>(null);
  const [todayPages,  setTodayPages]  = useState(0);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, hifzRes, reviewsRes, statsRes] = await Promise.all([
        quranApiNew.getPlans(),
        quranApiNew.getHifz(),
        quranApiNew.getReviewsDue(),
        quranApiNew.getStats(),
      ]);

      if (plansRes.success && plansRes.data) {
        const active = plansRes.data.find((p: KhatmaPlan) => p.status === 'active') ?? null;
        setActivePlan(active);
      }
      if (hifzRes.success    && hifzRes.data)    setHifz(hifzRes.data);
      if (reviewsRes.success && reviewsRes.data) setReviewsDue(reviewsRes.data);
      if (statsRes.success   && statsRes.data)   setStats(statsRes.data);

      // All failed = backend down → silent offline mode
      const allFailed = !plansRes.success && !hifzRes.success && !reviewsRes.success && !statsRes.success;
      if (allFailed) {
        console.warn('Backend unavailable — Quran in offline mode');
      }
    } catch {
      setError('حدث خطأ غير متوقع. أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const logSession = async (data: {
    type: 'reading' | 'hifz' | 'review';
    pages?: number;
    surah?: number;
    date: string;
  }) => {
    const payload: Pick<QuranSession, 'type' | 'date'> & Partial<QuranSession> = { type: data.type, date: data.date };
    if (data.type === 'reading' && data.pages && activePlan) {
      payload.fromPage = activePlan.currentPage;
      payload.toPage   = activePlan.currentPage + data.pages;
    }
    if (data.surah) payload.surah = data.surah;

    const res = await quranApiNew.logSession(payload);
    if (res.success) {
      // Optimistic: update todayPages locally
      if (data.type === 'reading' && data.pages) {
        setTodayPages(prev => prev + data.pages!);
      }
      await fetchAll();
    }
  };

  const updateHifz = async (surahNum: number, data: {
    memorizedAyahs?: number;
    status?: SurahHifz['status'];
    nextReviewDate?: string;
  }) => {
    const res = await quranApiNew.updateHifz(surahNum, data);
    if (res.success) await fetchAll();
  };

  const createPlan = async (data: { targetDays: number; dailyPages: number }) => {
    const res = await quranApiNew.createPlan(data);
    if (res.success) await fetchAll();
  };

  return {
    activePlan, hifz, reviewsDue, stats, todayPages,
    loading, error,
    logSession, updateHifz, createPlan,
    refetch: fetchAll,
  };
}
