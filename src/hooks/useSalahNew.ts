// ═══════════════════════════════════════════════════════════════
//  src/hooks/useSalahNew.ts
//  NEW Salah hook — uses api-new + types/new
//  Part of Salah vertical slice
//  DO NOT use in legacy screens
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { salahApiNew, profileApiNew } from '../lib/api/index';
import type {
  DayPrayerLog,
  PrayerTimes,
  PrayerStats,
  PrayerName,
  PrayerStatus,
  UserProfile,
} from '../types/new';

export interface UseSalahReturn {
  // Data
  prayerLog:    DayPrayerLog | null;
  times:        PrayerTimes  | null;
  stats:        PrayerStats  | null;
  qada:         { total: number; completed: number; remaining: number };
  profile:      UserProfile  | null;
  loading:      boolean;
  timesLoading: boolean;
  error:        string | null;

  // Actions
  fetchTimes:  (lat: number, lng: number, method?: number) => Promise<void>;
  logPrayer:   (prayer: PrayerName, status: PrayerStatus, options?: { jamaah?: boolean; sunnahBefore?: boolean; sunnahAfter?: boolean }) => Promise<void>;
  logExtra:    (type: 'witr' | 'qiyam' | 'duha', done: boolean) => Promise<void>;
  updateQada:  (delta: number) => Promise<void>;
  refetch:     () => Promise<void>;
}

export function useSalahNew(): UseSalahReturn {
  const today = new Date().toISOString().split('T')[0];

  const [prayerLog,  setPrayerLog]  = useState<DayPrayerLog | null>(null);
  const [times,      setTimes]      = useState<PrayerTimes  | null>(null);
  const [stats,      setStats]      = useState<PrayerStats  | null>(null);
  const [qada,       setQada]       = useState({ total: 0, completed: 0, remaining: 0 });
  const [profile,    setProfile]    = useState<UserProfile  | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [timesLoading, setTimesLoading] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── Fetch core data ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logRes, qadaRes, statsRes, profileRes] = await Promise.all([
        salahApiNew.getLog(today),
        salahApiNew.getQada(),
        salahApiNew.getStats('week'),
        profileApiNew.get(),
      ]);

      if (logRes.success && logRes.data)     setPrayerLog(logRes.data);
      if (qadaRes.success && qadaRes.data)   setQada(qadaRes.data);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
        const loc = profileRes.data.location;
        if (loc) {
          fetchTimesInternal(loc.lat, loc.lng, profileRes.data.prayerMethod ?? 5);
        }
      }

      // If all 4 requests failed, surface an error
      const allFailed =
        !logRes.success && !qadaRes.success && !statsRes.success && !profileRes.success;
      if (allFailed) {
        // Don't block UI — show offline mode with empty values
        console.warn('Backend unavailable — Salah in offline mode');
      }
    } catch (err: unknown) {
      setError('حدث خطأ غير متوقع. أعد المحاولة.');
    } finally {
      setLoading(false); // always runs — no stuck loading
    }
  }, [today]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Fetch prayer times ──────────────────────────────────────
  const fetchTimesInternal = async (lat: number, lng: number, method = 5) => {
    setTimesLoading(true);
    const res = await salahApiNew.getTimes(lat, lng, method);
    if (res.success && res.data) setTimes(res.data);
    setTimesLoading(false);
  };

  const fetchTimes = async (lat: number, lng: number, method = 5) => {
    await fetchTimesInternal(lat, lng, method);
  };

  // ── Actions ─────────────────────────────────────────────────
  const logPrayer = async (
    prayer: PrayerName,
    status: PrayerStatus,
    options?: { jamaah?: boolean; sunnahBefore?: boolean; sunnahAfter?: boolean }
  ) => {
    const res = await salahApiNew.logPrayer({ date: today, prayer, status, ...options });
    if (res.success) await fetchAll();
  };

  const logExtra = async (type: 'witr' | 'qiyam' | 'duha', done: boolean) => {
    const res = await salahApiNew.logExtra({ date: today, type, done });
    if (res.success) await fetchAll();
  };

  const updateQada = async (delta: number) => {
    const res = await salahApiNew.updateQada(delta);
    if (res.success) {
      setQada(prev => ({
        ...prev,
        remaining: Math.max(0, prev.remaining + delta),
        completed: delta < 0 ? prev.completed + Math.abs(delta) : prev.completed,
        total:     delta > 0 ? prev.total + delta : prev.total,
      }));
    }
  };

  return {
    prayerLog, times, stats, qada, profile,
    loading, timesLoading, error,
    fetchTimes, logPrayer, logExtra, updateQada,
    refetch: fetchAll,
  };
}
