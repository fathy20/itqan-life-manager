// ═══════════════════════════════════════════════════════════════
//  src/hooks/useAdhkarNew.ts
//  NEW Adhkar hook — uses api-new + types/new
//  Part of Adhkar vertical slice
//  DO NOT use in legacy screens
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { adhkarApiNew } from '../lib/api/index';
import type { DayAdhkarLog, AdhkarStats } from '../types/new';

export interface UseAdhkarReturn {
  // Data
  todayLog: DayAdhkarLog | null;
  stats:    AdhkarStats  | null;
  loading:  boolean;
  error:    string | null;

  // Actions
  logBlock:      (block: string) => Promise<void>;
  updateCounter: (counter: string, value: number) => Promise<void>;
  refetch:       () => Promise<void>;
}

export function useAdhkarNew(): UseAdhkarReturn {
  const [todayLog, setTodayLog] = useState<DayAdhkarLog | null>(null);
  const [stats,    setStats]    = useState<AdhkarStats  | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logRes, statsRes] = await Promise.all([
        adhkarApiNew.getToday(),
        adhkarApiNew.getStats('week'),
      ]);

      if (logRes.success && logRes.data)     setTodayLog(logRes.data);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);

      if (!logRes.success && !statsRes.success) {
        console.warn('Backend unavailable — Adhkar in offline mode');
      }
    } catch {
      setError('حدث خطأ غير متوقع. أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const logBlock = async (block: string) => {
    const res = await adhkarApiNew.logBlock(block);
    if (res.success) await fetchAll();
  };

  const updateCounter = async (counter: string, value: number) => {
    const res = await adhkarApiNew.updateCounter(counter, value);
    if (res.success && res.data) {
      setTodayLog(res.data);
    }
  };

  return { todayLog, stats, loading, error, logBlock, updateCounter, refetch: fetchAll };
}
