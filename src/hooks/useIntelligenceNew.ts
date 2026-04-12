import { useState, useEffect, useCallback } from 'react';
import { intelligenceApiNew } from '../lib/api/intelligence';
import type { IntelligenceReport } from '../lib/api/intelligence';

export interface UseIntelligenceReturn {
  report:  IntelligenceReport | null;
  loading: boolean;
  error:   string | null;
  refetch: () => Promise<void>;
}

export function useIntelligenceNew(): UseIntelligenceReturn {
  const [report,  setReport]  = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await intelligenceApiNew.getDashboard();
      if (res.success && res.data) setReport(res.data);
      else setError(res.message || 'فشل تحميل لوحة الذكاء.');
    } catch {
      setError('خطأ في الشبكة.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
}
