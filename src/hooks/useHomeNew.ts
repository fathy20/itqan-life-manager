// ═══════════════════════════════════════════════════════════════
//  src/hooks/useHomeNew.ts
//  NEW Home hook — Phase 1: score + salah summary + profile
//  Part of Home vertical slice
//  DO NOT use in legacy screens
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { profileApiNew, salahApiNew, scoreApiNew } from '../lib/api';
import type {
  UserProfile,
  DayPrayerLog,
  PrayerTimes,
  DailyScore,
  SharedScore,
} from '../types/new';

export interface UseHomeReturn {
  // Data
  profile:    UserProfile  | null;
  todayScore: DailyScore   | null;
  shared:     SharedScore  | null;
  prayerLog:  DayPrayerLog | null;
  times:      PrayerTimes  | null;

  // States
  loading:      boolean;
  timesLoading: boolean;
  error:        string | null;

  // Actions
  refetch: () => Promise<void>;
}

export function useHomeNew(): UseHomeReturn {
  const today = new Date().toISOString().split('T')[0];

  const [profile,    setProfile]    = useState<UserProfile  | null>(null);
  const [todayScore, setTodayScore] = useState<DailyScore   | null>(null);
  const [shared,     setShared]     = useState<SharedScore  | null>(null);
  const [prayerLog,  setPrayerLog]  = useState<DayPrayerLog | null>(null);
  const [times,      setTimes]      = useState<PrayerTimes  | null>(null);

  const [loading,      setLoading]      = useState(true);
  const [timesLoading, setTimesLoading] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const fetchTimesInternal = async (lat: number, lng: number, method = 5) => {
    setTimesLoading(true);
    try {
      const res = await salahApiNew.getTimes(lat, lng, method);
      if (res.success && res.data) setTimes(res.data);
    } finally {
      setTimesLoading(false);
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, scoreRes, sharedRes, logRes] = await Promise.all([
        profileApiNew.get(),
        scoreApiNew.getToday(),
        scoreApiNew.getShared(),
        salahApiNew.getLog(today),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
        const loc = profileRes.data.location;
        if (loc) {
          fetchTimesInternal(loc.lat, loc.lng, profileRes.data.prayerMethod ?? 5);
        }
      }
      if (scoreRes.success  && scoreRes.data)  setTodayScore(scoreRes.data);
      if (sharedRes.success && sharedRes.data) setShared(sharedRes.data);
      if (logRes.success    && logRes.data)    setPrayerLog(logRes.data);

      const allFailed =
        !profileRes.success && !scoreRes.success &&
        !sharedRes.success  && !logRes.success;
      if (allFailed) {
        setError('تعذّر تحميل البيانات. تحقق من الاتصال وأعد المحاولة.');
      }
    } catch {
      setError('حدث خطأ غير متوقع. أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return {
    profile, todayScore, shared, prayerLog, times,
    loading, timesLoading, error,
    refetch: fetchAll,
  };
}
