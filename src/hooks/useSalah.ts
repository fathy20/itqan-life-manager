import { useState, useEffect, useCallback } from 'react';
import { salahApi } from '../lib/api';

export function useSalah() {
  const today = new Date().toISOString().split('T')[0];
  const [prayerLog, setPrayerLog] = useState<any>(null);
  const [times, setTimes] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [qada, setQada] = useState<any>({ total: 0, completed: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [logRes, qadaRes, statsRes] = await Promise.all([
      salahApi.getLog(today),
      salahApi.getQada(),
      salahApi.getStats('week'),
    ]);
    if (logRes.success) setPrayerLog(logRes.data);
    if (qadaRes.success) setQada(qadaRes.data);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  }, [today]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchTimes = async (lat: number, lng: number, method = 5) => {
    const res = await salahApi.getTimes(lat, lng, method);
    if (res.success) setTimes(res.data);
  };

  const logPrayer = async (prayer: string, status: string, options?: any) => {
    const res = await salahApi.logPrayer({ date: today, prayer: prayer as any, status: status as any, ...options });
    if (res.success) fetchAll();
    return res;
  };

  const logExtra = async (type: 'witr' | 'qiyam' | 'duha', done: boolean) => {
    const res = await salahApi.logExtra({ date: today, type, done });
    if (res.success) fetchAll();
    return res;
  };

  const updateQada = async (delta: number) => {
    const res = await salahApi.updateQada(delta);
    if (res.success) setQada((prev: any) => ({
      ...prev,
      remaining: Math.max(0, prev.remaining + delta),
      completed: delta < 0 ? prev.completed + Math.abs(delta) : prev.completed,
      totalOwed: delta > 0 ? prev.totalOwed + delta : prev.totalOwed,
    }));
    return res;
  };

  return { prayerLog, times, stats, qada, loading, fetchTimes, logPrayer, logExtra, updateQada };
}
