import { useState, useEffect, useCallback } from 'react';
import { adhkarApi } from '../lib/api';

export function useAdhkar() {
  const [todayLog, setTodayLog] = useState<any>(null);
  const [stats, setStats] = useState<any>({ completionRate: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [logRes, statsRes] = await Promise.all([
      adhkarApi.getToday(),
      adhkarApi.getStats('week'),
    ]);
    if (logRes.success) setTodayLog(logRes.data);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const logBlock = async (block: string) => {
    const res = await adhkarApi.logBlock(block as any);
    if (res.success) fetchAll();
    return res;
  };

  const updateCounter = async (counter: string, value: number) => {
    const res = await adhkarApi.updateCounter(counter, value);
    if (res.success) setTodayLog((prev: any) => prev ? { ...prev, [counter]: value } : prev);
    return res;
  };

  return { todayLog, stats, loading, logBlock, updateCounter };
}
