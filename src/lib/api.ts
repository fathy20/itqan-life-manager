// ============================================================
// API CLIENT - Centralized HTTP client for all API calls
// Works with Web (React) and can be adapted for Flutter
// ============================================================

import { auth } from './firebase';
import { ROUTES } from '../../shared/constants';
import type {
  AdhkarStats,
  ApiResponse,
  Course,
  DailyScore,
  DashboardIntelligence,
  DayAdhkarLog,
  DayPrayerLog,
  FastingDay,
  FastingQada,
  FocusSession,
  Halaqah,
  HalaqahChallenge,
  HalaqahLeaderboardEntry,
  KhatmaPlan,
  PrayerStats,
  PrayerTimes,
  Project,
  QuranSession,
  SharedScore,
  Subject,
  SurahHifz,
  Task,
  Transaction,
  UserProfile,
  WishlistItem,
  Commitment,
} from '../types/new';

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
  get: () => apiFetch<UserProfile>(ROUTES.PROFILE),
  update: (data: Partial<UserProfile>) => apiFetch<UserProfile>(ROUTES.PROFILE, { method: 'PUT', body: JSON.stringify(data) }),
};

export const subjectsApi = createCrudApi<Subject>(ROUTES.SUBJECTS);
export const tasksApi = createCrudApi<Task>(ROUTES.TASKS);
export const projectsApi = createCrudApi<Project>(ROUTES.PROJECTS);
export const coursesApi = createCrudApi<Course>(ROUTES.COURSES);
export const habitsApi = createCrudApi<Record<string, unknown>>(ROUTES.HABITS);
export const lifestyleApi = createCrudApi<Record<string, unknown>>(ROUTES.LIFESTYLE);

export const financeApi = {
  transactions: createCrudApi<Transaction>(ROUTES.FINANCE.TRANSACTIONS),
  wishlist: createCrudApi<WishlistItem>(ROUTES.FINANCE.WISHLIST),
  commitments: createCrudApi<Commitment>(ROUTES.FINANCE.COMMITMENTS),
  getSalary: () => apiFetch<{ monthlySalary: number }>(ROUTES.FINANCE.SALARY),
  setSalary: (amount: number) => apiFetch<{ monthlySalary: number }>(ROUTES.FINANCE.SALARY, { method: 'PUT', body: JSON.stringify({ monthlySalary: amount }) }),
};

export const focusApi = {
  list: () => apiFetch<FocusSession[]>(ROUTES.FOCUS),
  create: (data: Partial<FocusSession>) => apiFetch<FocusSession>(ROUTES.FOCUS, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Islamic Modules ──────────────────────────────────────────
const V1 = '/api/v1';

export const salahApi = {
  getTimes: (lat: number, lng: number, method = 5) => apiFetch<PrayerTimes>(`${V1}/salah/times?lat=${lat}&lng=${lng}&method=${method}`),
  getLog: (date: string) => apiFetch<DayPrayerLog>(`${V1}/salah/log/${date}`),
  logPrayer: (data: unknown) => apiFetch<DayPrayerLog>(`${V1}/salah/log`, { method: 'POST', body: JSON.stringify(data) }),
  logExtra: (data: unknown) => apiFetch<DayPrayerLog>(`${V1}/salah/log/extra`, { method: 'POST', body: JSON.stringify(data) }),
  getStats: (period: 'week' | 'month') => apiFetch<PrayerStats>(`${V1}/salah/stats?period=${period}`),
  getQada: () => apiFetch<Record<string, number>>(`${V1}/salah/qada`),
  updateQada: (delta: number) => apiFetch<Record<string, number>>(`${V1}/salah/qada`, { method: 'PUT', body: JSON.stringify({ delta }) }),
};

export const quranApi = {
  getPlans: () => apiFetch<KhatmaPlan[]>(`${V1}/quran/plans`),
  createPlan: (data: Partial<KhatmaPlan>) => apiFetch<KhatmaPlan>(`${V1}/quran/plans`, { method: 'POST', body: JSON.stringify(data) }),
  updatePlan: (id: string, data: Partial<KhatmaPlan>) => apiFetch<KhatmaPlan>(`${V1}/quran/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  logSession: (data: Partial<QuranSession>) => apiFetch<QuranSession>(`${V1}/quran/log`, { method: 'POST', body: JSON.stringify(data) }),
  getHifz: () => apiFetch<SurahHifz[]>(`${V1}/quran/hifz`),
  updateHifz: (surahNum: number, data: Partial<SurahHifz>) => apiFetch<SurahHifz>(`${V1}/quran/hifz/${surahNum}`, { method: 'PUT', body: JSON.stringify(data) }),
  getReviewsDue: () => apiFetch<SurahHifz[]>(`${V1}/quran/reviews/due`),
  getStats: () => apiFetch<Record<string, unknown>>(`${V1}/quran/stats`),
};

export const adhkarApi = {
  getToday: () => apiFetch<DayAdhkarLog>(`${V1}/adhkar/today`),
  logBlock: (block: string) => apiFetch<DayAdhkarLog>(`${V1}/adhkar/log`, { method: 'POST', body: JSON.stringify({ block }) }),
  updateCounter: (counter: string, value: number) => apiFetch<DayAdhkarLog>(`${V1}/adhkar/counter`, { method: 'PUT', body: JSON.stringify({ counter, value }) }),
  getStats: (period: 'week' | 'month') => apiFetch<AdhkarStats>(`${V1}/adhkar/stats?period=${period}`),
};

export const scoreApi = {
  getToday: () => apiFetch<ApiResponse<DailyScore>>(`${V1}/score/today`),
  getWeek: () => apiFetch<ApiResponse<DailyScore[]>>(`${V1}/score/week`),
  getShared: () => apiFetch<ApiResponse<SharedScore>>(`${V1}/score/shared`),
  compute: () => apiFetch<ApiResponse<DailyScore>>(`${V1}/score/compute`, { method: 'POST' }),
};

export const fastingApi = {
  getMonth: (year: number, month: number) => apiFetch<FastingDay[]>(`${V1}/fasting/month/${year}/${month}`),
  logDay: (data: Partial<FastingDay>) => apiFetch<FastingDay>(`${V1}/fasting/log`, { method: 'POST', body: JSON.stringify(data) }),
  getQada: () => apiFetch<FastingQada>(`${V1}/fasting/qada`),
  updateQada: (delta: number) => apiFetch<FastingQada>(`${V1}/fasting/qada`, { method: 'PUT', body: JSON.stringify({ delta }) }),
  getSuggestions: () => apiFetch<FastingDay[]>(`${V1}/fasting/suggestions`),
};

export const intelligenceApi = {
  getDashboard: () => apiFetch<ApiResponse<DashboardIntelligence>>(`${V1}/intelligence/dashboard`),
};

export const halaqahApi = {
  getAll: () => apiFetch<Halaqah[]>(`${V1}/halaqah`),
  create: (name: string) => apiFetch<Halaqah>(`${V1}/halaqah`, { method: 'POST', body: JSON.stringify({ name }) }),
  join: (inviteCode: string) => apiFetch<Halaqah>(`${V1}/halaqah/join`, { method: 'POST', body: JSON.stringify({ inviteCode }) }),
  leave: (id: string) => apiFetch<void>(`${V1}/halaqah/${id}/leave`, { method: 'DELETE' }),
  getLeaderboard: (id: string) => apiFetch<HalaqahLeaderboardEntry[]>(`${V1}/halaqah/${id}/leaderboard`),
  getDuas: (id: string) => apiFetch<Record<string, unknown>[]>(`${V1}/halaqah/${id}/duas`),
  addDua: (id: string, text: string) => apiFetch<Record<string, unknown>>(`${V1}/halaqah/${id}/duas`, { method: 'POST', body: JSON.stringify({ text }) }),
  prayForDua: (id: string, duaId: string) => apiFetch<Record<string, unknown>>(`${V1}/halaqah/${id}/duas/${duaId}/pray`, { method: 'POST' }),
  sendNaseeha: (id: string, text: string) => apiFetch<Record<string, unknown>>(`${V1}/halaqah/${id}/naseeha`, { method: 'POST', body: JSON.stringify({ text }) }),
  getChallenge: (id: string) => apiFetch<HalaqahChallenge>(`${V1}/halaqah/${id}/challenge`),
  completeChallenge: (id: string, challengeId: string) => apiFetch<HalaqahChallenge>(`${V1}/halaqah/${id}/challenge/${challengeId}/complete`, { method: 'POST' }),
};

export default apiFetch;
