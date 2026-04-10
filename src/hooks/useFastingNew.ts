import { useState, useEffect, useCallback } from 'react';
import { fastingApiNew } from '../lib/api/index';
import type { FastingDay, FastingQada, FastingType } from '../types/new';

export interface UseFastingReturn {
  days:        FastingDay[];
  qada:        FastingQada | null;
  suggestions: string[];
  loading:     boolean;
  error:       string | null;
  year:        number;
  month:       number;

  setMonth:    (year: number, month: number) => void;
  logDay:      (date: string, type: FastingType, completed: boolean, notes?: string) => Promise<void>;
  updateDay:   (date: string, completed: boolean, notes?: string) => Promise<void>;
  updateQada:  (totalOwed: number, completed: number) => Promise<void>;
  refetch:     () => Promise<void>;
}

export function useFastingNew(): UseFastingReturn {
  const now = new Date();
  const [year,        setYear]        = useState(now.getFullYear());
  const [month,       setMonthState]  = useState(now.getMonth() + 1);
  const [days,        setDays]        = useState<FastingDay[]>([]);
  const [qada,        setQada]        = useState<FastingQada | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const fetchAll = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const [daysRes, qadaRes, sugRes] = await Promise.all([
        fastingApiNew.getMonth(y, m),
        fastingApiNew.getQada(),
        fastingApiNew.getSuggestions(),
      ]);
      if (daysRes.success && daysRes.data) setDays(daysRes.data);
      else if (!daysRes.success) console.warn('Backend unavailable — Fasting in offline mode');
      if (qadaRes.success && qadaRes.data) setQada(qadaRes.data);
      if (sugRes.success && sugRes.data) setSuggestions(sugRes.data);
    } catch {
      setError('حدث خطأ غير متوقع. أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(year, month); }, [fetchAll, year, month]);

  const setMonth = (y: number, m: number) => {
    setYear(y);
    setMonthState(m);
  };

  const logDay = async (date: string, type: FastingType, completed: boolean, notes?: string) => {
    const res = await fastingApiNew.logDay(date, type, completed, notes);
    if (res.success && res.data) {
      setDays(prev => {
        const idx = prev.findIndex(d => d.date === date);
        return idx >= 0 ? prev.map((d, i) => i === idx ? res.data! : d) : [res.data!, ...prev];
      });
    }
  };

  const updateDay = async (date: string, completed: boolean, notes?: string) => {
    const res = await fastingApiNew.updateDay(date, completed, notes);
    if (res.success && res.data) {
      setDays(prev => prev.map(d => d.date === date ? res.data! : d));
    }
  };

  const updateQada = async (totalOwed: number, completed: number) => {
    const res = await fastingApiNew.updateQada(totalOwed, completed);
    if (res.success && res.data) setQada(res.data);
  };

  return {
    days, qada, suggestions, loading, error, year, month,
    setMonth, logDay, updateDay, updateQada,
    refetch: () => fetchAll(year, month),
  };
}
