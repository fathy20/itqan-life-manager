import { useState, useCallback } from 'react';
import { aiApiNew } from '../lib/api/ai';
import type { ChatMessage, DayPlan, WeeklyReview } from '../lib/api/ai';

export interface UseAIReturn {
  messages:      ChatMessage[];
  planDay:       DayPlan | null;
  weeklyReview:  WeeklyReview | null;
  chatLoading:   boolean;
  planLoading:   boolean;
  reviewLoading: boolean;
  error:         string | null;

  sendMessage:       (text: string) => Promise<void>;
  generatePlanDay:   () => Promise<void>;
  generateReview:    () => Promise<void>;
  clearChat:         () => void;
  clearError:        () => void;
}

export function useAINew(): UseAIReturn {
  const [messages,      setMessages]      = useState<ChatMessage[]>([]);
  const [planDay,       setPlanDay]       = useState<DayPlan | null>(null);
  const [weeklyReview,  setWeeklyReview]  = useState<WeeklyReview | null>(null);
  const [chatLoading,   setChatLoading]   = useState(false);
  const [planLoading,   setPlanLoading]   = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    setError(null);
    try {
      const res = await aiApiNew.chat(text, [...messages, userMsg]);
      if (res.success && res.data) {
        setMessages(prev => [...prev, { role: 'coach', text: res.data!.reply }]);
      } else {
        setError(res.message || 'فشل الاتصال بالمدرب.');
        setMessages(prev => prev.slice(0, -1)); // remove user msg on failure
      }
    } catch {
      setError('خطأ في الشبكة. حاول مرة أخرى.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  }, [messages]);

  const generatePlanDay = useCallback(async () => {
    setPlanLoading(true);
    setError(null);
    try {
      const res = await aiApiNew.planDay();
      if (res.success && res.data) setPlanDay(res.data);
      else setError(res.message || 'فشل توليد خطة اليوم.');
    } catch {
      setError('خطأ في الشبكة.');
    } finally {
      setPlanLoading(false);
    }
  }, []);

  const generateReview = useCallback(async () => {
    setReviewLoading(true);
    setError(null);
    try {
      const res = await aiApiNew.weeklyReview();
      if (res.success && res.data) setWeeklyReview(res.data);
      else setError(res.message || 'فشل توليد المراجعة الأسبوعية.');
    } catch {
      setError('خطأ في الشبكة.');
    } finally {
      setReviewLoading(false);
    }
  }, []);

  return {
    messages, planDay, weeklyReview,
    chatLoading, planLoading, reviewLoading, error,
    sendMessage, generatePlanDay, generateReview,
    clearChat: () => setMessages([]),
    clearError: () => setError(null),
  };
}
