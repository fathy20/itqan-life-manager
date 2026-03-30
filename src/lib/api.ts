// ============================================================
// API CLIENT - Centralized HTTP client for all API calls
// Works with Web (React) and can be adapted for Flutter
// ============================================================

import { auth } from './firebase';
import { ROUTES } from '../../shared/constants';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Core fetch wrapper ───────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Generic CRUD factory ─────────────────────────────────────
function createCrudApi<T>(route: string) {
  return {
    list: () => apiFetch<T[]>(route),
    get: (id: string) => apiFetch<T>(`${route}/${id}`),
    create: (data: Partial<T>) => apiFetch<T>(route, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<T>) => apiFetch<T>(`${route}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`${route}/${id}`, { method: 'DELETE' }),
  };
}

// ── API modules ──────────────────────────────────────────────
export const profileApi = {
  get: () => apiFetch<any>(ROUTES.PROFILE),
  update: (data: any) => apiFetch<any>(ROUTES.PROFILE, { method: 'PUT', body: JSON.stringify(data) }),
};

export const subjectsApi = createCrudApi<any>(ROUTES.SUBJECTS);
export const tasksApi = createCrudApi<any>(ROUTES.TASKS);
export const projectsApi = createCrudApi<any>(ROUTES.PROJECTS);
export const coursesApi = createCrudApi<any>(ROUTES.COURSES);
export const habitsApi = createCrudApi<any>(ROUTES.HABITS);
export const lifestyleApi = createCrudApi<any>(ROUTES.LIFESTYLE);

export const financeApi = {
  transactions: createCrudApi<any>(ROUTES.FINANCE.TRANSACTIONS),
  wishlist: createCrudApi<any>(ROUTES.FINANCE.WISHLIST),
  commitments: createCrudApi<any>(ROUTES.FINANCE.COMMITMENTS),
  getSalary: () => apiFetch<{ monthlySalary: number }>(ROUTES.FINANCE.SALARY),
  setSalary: (amount: number) => apiFetch<any>(ROUTES.FINANCE.SALARY, { method: 'PUT', body: JSON.stringify({ monthlySalary: amount }) }),
};

export const focusApi = {
  list: () => apiFetch<any[]>(ROUTES.FOCUS),
  create: (data: any) => apiFetch<any>(ROUTES.FOCUS, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Islamic Modules ──────────────────────────────────────────
const V1 = '/api/v1';

export const salahApi = {
  getTimes: (lat: number, lng: number, method = 5) => apiFetch<any>(`${V1}/salah/times?lat=${lat}&lng=${lng}&method=${method}`),
  getLog: (date: string) => apiFetch<any>(`${V1}/salah/log/${date}`),
  logPrayer: (data: any) => apiFetch<any>(`${V1}/salah/log`, { method: 'POST', body: JSON.stringify(data) }),
  logExtra: (data: any) => apiFetch<any>(`${V1}/salah/log/extra`, { method: 'POST', body: JSON.stringify(data) }),
  getStats: (period: 'week' | 'month') => apiFetch<any>(`${V1}/salah/stats?period=${period}`),
  getQada: () => apiFetch<any>(`${V1}/salah/qada`),
  updateQada: (delta: number) => apiFetch<any>(`${V1}/salah/qada`, { method: 'PUT', body: JSON.stringify({ delta }) }),
};

export const quranApi = {
  getPlans: () => apiFetch<any[]>(`${V1}/quran/plans`),
  createPlan: (data: any) => apiFetch<any>(`${V1}/quran/plans`, { method: 'POST', body: JSON.stringify(data) }),
  updatePlan: (id: string, data: any) => apiFetch<any>(`${V1}/quran/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  logSession: (data: any) => apiFetch<any>(`${V1}/quran/log`, { method: 'POST', body: JSON.stringify(data) }),
  getHifz: () => apiFetch<any[]>(`${V1}/quran/hifz`),
  updateHifz: (surahNum: number, data: any) => apiFetch<any>(`${V1}/quran/hifz/${surahNum}`, { method: 'PUT', body: JSON.stringify(data) }),
  getReviewsDue: () => apiFetch<any[]>(`${V1}/quran/reviews/due`),
  getStats: () => apiFetch<any>(`${V1}/quran/stats`),
};

export const adhkarApi = {
  getToday: () => apiFetch<any>(`${V1}/adhkar/today`),
  logBlock: (block: string) => apiFetch<any>(`${V1}/adhkar/log`, { method: 'POST', body: JSON.stringify({ block }) }),
  updateCounter: (counter: string, value: number) => apiFetch<any>(`${V1}/adhkar/counter`, { method: 'PUT', body: JSON.stringify({ counter, value }) }),
  getStats: (period: 'week' | 'month') => apiFetch<any>(`${V1}/adhkar/stats?period=${period}`),
};

export const scoreApi = {
  getToday: () => apiFetch<any>(`${V1}/score/today`),
  getWeek: () => apiFetch<any[]>(`${V1}/score/week`),
  getShared: () => apiFetch<any>(`${V1}/score/shared`),
  compute: () => apiFetch<any>(`${V1}/score/compute`, { method: 'POST' }),
};

export const fastingApi = {
  getMonth: (year: number, month: number) => apiFetch<any[]>(`${V1}/fasting/month/${year}/${month}`),
  logDay: (data: any) => apiFetch<any>(`${V1}/fasting/log`, { method: 'POST', body: JSON.stringify(data) }),
  getQada: () => apiFetch<any>(`${V1}/fasting/qada`),
  updateQada: (delta: number) => apiFetch<any>(`${V1}/fasting/qada`, { method: 'PUT', body: JSON.stringify({ delta }) }),
  getSuggestions: () => apiFetch<any[]>(`${V1}/fasting/suggestions`),
};

export const intelligenceApi = {
  getDashboard: () => apiFetch<any>(`${V1}/intelligence/dashboard`),
};

export const halaqahApi = {
  getAll: () => apiFetch<any[]>(`${V1}/halaqah`),
  create: (name: string) => apiFetch<any>(`${V1}/halaqah`, { method: 'POST', body: JSON.stringify({ name }) }),
  join: (inviteCode: string) => apiFetch<any>(`${V1}/halaqah/join`, { method: 'POST', body: JSON.stringify({ inviteCode }) }),
  leave: (id: string) => apiFetch<any>(`${V1}/halaqah/${id}/leave`, { method: 'DELETE' }),
  getLeaderboard: (id: string) => apiFetch<any[]>(`${V1}/halaqah/${id}/leaderboard`),
  getDuas: (id: string) => apiFetch<any[]>(`${V1}/halaqah/${id}/duas`),
  addDua: (id: string, text: string) => apiFetch<any>(`${V1}/halaqah/${id}/duas`, { method: 'POST', body: JSON.stringify({ text }) }),
  prayForDua: (id: string, duaId: string) => apiFetch<any>(`${V1}/halaqah/${id}/duas/${duaId}/pray`, { method: 'POST' }),
  sendNaseeha: (id: string, text: string) => apiFetch<any>(`${V1}/halaqah/${id}/naseeha`, { method: 'POST', body: JSON.stringify({ text }) }),
  getChallenge: (id: string) => apiFetch<any>(`${V1}/halaqah/${id}/challenge`),
  completeChallenge: (id: string, challengeId: string) => apiFetch<any>(`${V1}/halaqah/${id}/challenge/${challengeId}/complete`, { method: 'POST' }),
};

export default apiFetch;
