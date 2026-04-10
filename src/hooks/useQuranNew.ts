// ═══════════════════════════════════════════════════════════════
//  src/hooks/useQuranNew.ts
//  NEW Quran hook — Phase 1: khatma + hifz + stats + log session
//  Part of Quran vertical slice
//  DO NOT use in legacy screens
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { quranApiNew } from '../lib/api/index';
import type { KhatmaPlan, SurahHifz } from '../types/new';

export interface QuranStats {
  weeklyPages:    number;
  totalMemorized: number;
  reviewsDue:     number;
}

export interface UseQuranReturn {
  // Data
  activePlan:  KhatmaPlan  | null;
  hifz:        SurahHifz[];
  reviewsDue:  SurahHifz[];
  stats:       QuranStats;
  todayPages:  number;        // pages logged today (derived from sessions)

  // States
  loading: boolean;
  error:   string | null;

  // Actions
  logSession: (data: {
    type: 'reading' | 'hifz' | 'review';
    pages?: number;           // shorthand: fromPage = currentPage, toPage = currentPage + pages
    fromPage?: number;
    toPage?: number;
    surah?: number;
    durationMinutes?: number;
  }) => Promise<void>;
  updateHifz: (surahNum: number, data: {
    memorizedAyahs?: number;
    status?: SurahHifz['status'];
    nextReviewDate?: string;
  }) => Promise<void>;
  createPlan: (data: { targetDays: number; dailyPages: number; startPage?: number }) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useQuranNew(): UseQuranReturn {
  const today = new Date().toISOString().split('T')[0];

  const [activePlan,  setActivePlan]  = useState<KhatmaPlan | null>(null);
  const [hifz,        setHifz]        = useState<SurahHifz[]>([]);
  const [reviewsDue,  setReviewsDue]  = useState<SurahHifz[]>([]);
  const [stats,       setStats]       = useState<QuranStats>({ weeklyPages: 0, totalMemorized: 0, reviewsDue: 0 });
  const [todayPages,  setTodayPages]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

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
      if (statsRes.success   && statsRes.data) {
        setStats(statsRes.data);
        // reviewsDue count from stats is more reliable than the list length
      }

      // Silent offline mode — no blocking error
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

  // ── Actions ─────────────────────────────────────────────────

  const logSession = async (data: {
    type: 'reading' | 'hifz' | 'review';
    pages?: number;
    fromPage?: number;
    toPage?: number;
    surah?: number;
    durationMinutes?: number;
  }) => {
    // Resolve fromPage/toPage from shorthand `pages`
    let fromPage = data.fromPage;
    let toPage   = data.toPage;

    if (data.pages && data.pages > 0 && activePlan) {
      fromPage = activePlan.currentPage;
      toPage   = activePlan.currentPage + data.pages - 1;
    }

    const res = await quranApiNew.logSession({
      type: data.type,
      fromPage,
      toPage,
      surah: data.surah,
      durationMinutes: data.durationMinutes,
      date: today,
    });

    if (res.success) {
      // Optimistic: update todayPages locally
      if (data.type === 'reading' && data.pages) {
        setTodayPages(prev => prev + data.pages!);
      }
      await fetchAll(); // refetch to sync plan currentPage
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

  const createPlan = async (data: { targetDays: number; dailyPages: number; startPage?: number }) => {
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
