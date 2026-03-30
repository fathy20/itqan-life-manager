import { useState } from 'react';
import { auth } from '../lib/firebase';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function callAI(endpoint: string, body?: object) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${API}/api/v1/ai/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json();
  if (!res.ok) throw { code: data.code, message: data.message, requiredPlan: data.requiredPlan };
  return data.data;
}

export function useAI() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const call = async (key: string, fn: () => Promise<any>) => {
    setLoading(p => ({ ...p, [key]: true }));
    setError(p => ({ ...p, [key]: '' }));
    try {
      return await fn();
    } catch (err: any) {
      const msg = err.code === 'PLAN_LIMIT'
        ? `هذه الميزة تتطلب خطة ${err.requiredPlan}`
        : err.code === 'AI_DAILY_LIMIT'
        ? 'وصلت للحد اليومي. ترقّ للمزيد'
        : err.message || 'حدث خطأ';
      setError(p => ({ ...p, [key]: msg }));
      return null;
    } finally {
      setLoading(p => ({ ...p, [key]: false }));
    }
  };

  return {
    loading,
    error,
    sendCoachMessage: (message: string, history: any[]) => call('coach', () => callAI('coach', { message, history })),
    planDay: () => call('planDay', () => callAI('plan-day')),
    studyStrategy: () => call('studyStrategy', () => callAI('study-strategy')),
    financeInsights: () => call('financeInsights', () => callAI('finance-insights')),
  };
}
