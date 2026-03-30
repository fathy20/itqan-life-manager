// ═══════════════════════════════════════════════════════════════
//  src/lib/api.ts
//  API Client — All frontend-to-backend communication goes here
//  Uses Firebase Auth token for authentication
// ═══════════════════════════════════════════════════════════════

import { auth } from "./firebase";
import type { ApiResponse } from "../../shared/types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Core Request Function ───────────────────────────────────

async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Error ${res.status}`,
        code: data.code || "UNKNOWN_ERROR",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
      code: "NETWORK_ERROR",
    };
  }
}

// ─── HTTP Methods ────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};

// ═══════════════════════════════════════════════════════════════
//  API ENDPOINTS — organized by module
// ═══════════════════════════════════════════════════════════════

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
  me: () => api.get<{ uid: string; email: string }>("/api/v1/auth/me"),
};

// ─── Profile ─────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get<import("../../shared/types").UserProfile>("/api/v1/profile"),
  update: (data: Partial<import("../../shared/types").UserProfile>) =>
    api.put("/api/v1/profile", data),
};

// ─── Salah ───────────────────────────────────────────────────
export const salahApi = {
  getTimes: (lat: number, lng: number, method = 5) =>
    api.get<import("../../shared/types").PrayerTimes>(
      `/api/v1/salah/times?lat=${lat}&lng=${lng}&method=${method}`
    ),
  getLog: (date: string) =>
    api.get<import("../../shared/types").DayPrayerLog>(`/api/v1/salah/log/${date}`),
  logPrayer: (data: {
    date: string;
    prayer: import("../../shared/types").PrayerName;
    status: import("../../shared/types").PrayerStatus;
    jamaah?: boolean;
    sunnahBefore?: boolean;
    sunnahAfter?: boolean;
  }) => api.post("/api/v1/salah/log", data),
  logExtra: (data: { date: string; type: "witr" | "qiyam" | "duha"; done: boolean }) =>
    api.post("/api/v1/salah/log/extra", data),
  getStats: (period: "week" | "month") =>
    api.get<import("../../shared/types").PrayerStats>(`/api/v1/salah/stats?period=${period}`),
  getQada: () => api.get<{ total: number; completed: number; remaining: number }>("/api/v1/salah/qada"),
  updateQada: (delta: number) => api.put("/api/v1/salah/qada", { delta }),
};

// ─── Quran ───────────────────────────────────────────────────
export const quranApi = {
  getPlans: () =>
    api.get<import("../../shared/types").KhatmaPlan[]>("/api/v1/quran/plans"),
  createPlan: (data: Partial<import("../../shared/types").KhatmaPlan>) =>
    api.post("/api/v1/quran/plans", data),
  updatePlan: (id: string, data: Partial<import("../../shared/types").KhatmaPlan>) =>
    api.put(`/api/v1/quran/plans/${id}`, data),
  logSession: (data: Omit<import("../../shared/types").QuranSession, "id" | "createdAt">) =>
    api.post("/api/v1/quran/log", data),
  getHifz: () =>
    api.get<import("../../shared/types").SurahHifz[]>("/api/v1/quran/hifz"),
  updateHifz: (surahNum: number, data: Partial<import("../../shared/types").SurahHifz>) =>
    api.put(`/api/v1/quran/hifz/${surahNum}`, data),
  getReviewsDue: () =>
    api.get<import("../../shared/types").SurahHifz[]>("/api/v1/quran/reviews/due"),
  getStats: () =>
    api.get<{ weeklyPages: number; totalMemorized: number; reviewsDue: number }>("/api/v1/quran/stats"),
};

// ─── Adhkar ──────────────────────────────────────────────────
export const adhkarApi = {
  getToday: () =>
    api.get<import("../../shared/types").DayAdhkarLog>("/api/v1/adhkar/today"),
  logBlock: (block: "morning" | "evening" | "sleep" | "afterPrayer") =>
    api.post("/api/v1/adhkar/log", { block }),
  updateCounter: (counter: string, value: number) =>
    api.put("/api/v1/adhkar/counter", { counter, value }),
  getStats: (period: "week" | "month") =>
    api.get<{ completionRate: number; streak: number }>(`/api/v1/adhkar/stats?period=${period}`),
};

// ─── Fasting ─────────────────────────────────────────────────
export const fastingApi = {
  getMonth: (year: number, month: number) =>
    api.get<import("../../shared/types").FastingDay[]>(`/api/v1/fasting/month/${year}/${month}`),
  logDay: (data: Omit<import("../../shared/types").FastingDay, "createdAt">) =>
    api.post("/api/v1/fasting/log", data),
  getQada: () =>
    api.get<import("../../shared/types").FastingQada>("/api/v1/fasting/qada"),
  updateQada: (delta: number) =>
    api.put("/api/v1/fasting/qada", { delta }),
  getSuggestions: () =>
    api.get<{ date: string; type: import("../../shared/types").FastingType; reason: string }[]>(
      "/api/v1/fasting/suggestions"
    ),
};

// ─── Zakat ───────────────────────────────────────────────────
export const zakatApi = {
  calculate: (assets: import("../../shared/types").ZakatAssets) =>
    api.post<import("../../shared/types").ZakatCalculation>("/api/v1/zakat/calculate", assets),
  getNisab: () =>
    api.get<{ goldPricePerGram: number; nisabEGP: number }>("/api/v1/zakat/nisab"),
  logPayment: (amount: number) =>
    api.post("/api/v1/zakat/pay", { amount }),
};

// ─── Study ───────────────────────────────────────────────────
export const studyApi = {
  getSubjects: () =>
    api.get<import("../../shared/types").Subject[]>("/api/v1/subjects"),
  createSubject: (data: Omit<import("../../shared/types").Subject, "id" | "createdAt" | "updatedAt">) =>
    api.post("/api/v1/subjects", data),
  updateSubject: (id: string, data: Partial<import("../../shared/types").Subject>) =>
    api.put(`/api/v1/subjects/${id}`, data),
  deleteSubject: (id: string) =>
    api.delete(`/api/v1/subjects/${id}`),
};

// ─── Work ────────────────────────────────────────────────────
export const workApi = {
  getTasks: () =>
    api.get<import("../../shared/types").Task[]>("/api/v1/tasks"),
  createTask: (data: Omit<import("../../shared/types").Task, "id" | "createdAt" | "updatedAt">) =>
    api.post("/api/v1/tasks", data),
  updateTask: (id: string, data: Partial<import("../../shared/types").Task>) =>
    api.put(`/api/v1/tasks/${id}`, data),
  deleteTask: (id: string) =>
    api.delete(`/api/v1/tasks/${id}`),
  getProjects: () =>
    api.get<import("../../shared/types").Project[]>("/api/v1/projects"),
  createProject: (data: Omit<import("../../shared/types").Project, "id" | "createdAt" | "updatedAt">) =>
    api.post("/api/v1/projects", data),
  updateProject: (id: string, data: Partial<import("../../shared/types").Project>) =>
    api.put(`/api/v1/projects/${id}`, data),
  getCourses: () =>
    api.get<import("../../shared/types").Course[]>("/api/v1/courses"),
  createCourse: (data: Omit<import("../../shared/types").Course, "id" | "createdAt" | "updatedAt">) =>
    api.post("/api/v1/courses", data),
  updateCourse: (id: string, data: Partial<import("../../shared/types").Course>) =>
    api.put(`/api/v1/courses/${id}`, data),
};

// ─── Finance ─────────────────────────────────────────────────
export const financeApi = {
  getTransactions: () =>
    api.get<import("../../shared/types").Transaction[]>("/api/v1/finance/transactions"),
  createTransaction: (data: Omit<import("../../shared/types").Transaction, "id" | "createdAt" | "updatedAt">) =>
    api.post("/api/v1/finance/transactions", data),
  deleteTransaction: (id: string) =>
    api.delete(`/api/v1/finance/transactions/${id}`),
  getWishlist: () =>
    api.get<import("../../shared/types").WishlistItem[]>("/api/v1/finance/wishlist"),
  createWishlistItem: (data: Omit<import("../../shared/types").WishlistItem, "id" | "createdAt" | "updatedAt">) =>
    api.post("/api/v1/finance/wishlist", data),
  updateWishlistItem: (id: string, data: Partial<import("../../shared/types").WishlistItem>) =>
    api.put(`/api/v1/finance/wishlist/${id}`, data),
  getCommitments: () =>
    api.get<import("../../shared/types").Commitment[]>("/api/v1/finance/commitments"),
  createCommitment: (data: Omit<import("../../shared/types").Commitment, "id" | "createdAt" | "updatedAt">) =>
    api.post("/api/v1/finance/commitments", data),
};

// ─── Lifestyle ───────────────────────────────────────────────
export const lifestyleApi = {
  getHabits: () =>
    api.get<import("../../shared/types").Habit[]>("/api/v1/habits"),
  createHabit: (data: { name: string; nameAr?: string }) =>
    api.post("/api/v1/habits", data),
  toggleHabit: (id: string, date: string) =>
    api.put(`/api/v1/habits/${id}`, { toggleDate: date }),
  deleteHabit: (id: string) =>
    api.delete(`/api/v1/habits/${id}`),
  getLogs: () =>
    api.get<import("../../shared/types").LifestyleLog[]>("/api/v1/lifestyle"),
  logDay: (data: Omit<import("../../shared/types").LifestyleLog, "createdAt">) =>
    api.post("/api/v1/lifestyle", data),
};

// ─── Focus ───────────────────────────────────────────────────
export const focusApi = {
  getSessions: () =>
    api.get<import("../../shared/types").FocusSession[]>("/api/v1/focus/sessions"),
  logSession: (data: Omit<import("../../shared/types").FocusSession, "id" | "createdAt">) =>
    api.post("/api/v1/focus/sessions", data),
};

// ─── Score ───────────────────────────────────────────────────
export const scoreApi = {
  getToday: () =>
    api.get<import("../../shared/types").DailyScore>("/api/v1/score/today"),
  getWeek: () =>
    api.get<import("../../shared/types").DailyScore[]>("/api/v1/score/week"),
  getShared: () =>
    api.get<import("../../shared/types").SharedScore>("/api/v1/score/shared"),
};

// ─── Halaqah ─────────────────────────────────────────────────
export const halaqahApi = {
  getAll: () =>
    api.get<import("../../shared/types").Halaqah[]>("/api/v1/halaqah"),
  create: (data: { name: string }) =>
    api.post<import("../../shared/types").Halaqah>("/api/v1/halaqah", data),
  join: (inviteCode: string) =>
    api.post("/api/v1/halaqah/join", { inviteCode }),
  leave: (id: string) =>
    api.delete(`/api/v1/halaqah/${id}/leave`),
  getLeaderboard: (id: string) =>
    api.get<(import("../../shared/types").SharedScore & { name: string; uid: string })[]>(
      `/api/v1/halaqah/${id}/leaderboard`
    ),
  getChallenge: (id: string) =>
    api.get<import("../../shared/types").HalaqahChallenge>(`/api/v1/halaqah/${id}/challenge`),
  completeChallenge: (id: string) =>
    api.post(`/api/v1/halaqah/${id}/challenge/complete`),
  getDuas: (id: string) =>
    api.get<import("../../shared/types").DuaRequest[]>(`/api/v1/halaqah/${id}/duas`),
  addDua: (id: string, text: string) =>
    api.post(`/api/v1/halaqah/${id}/duas`, { text }),
  prayForDua: (halaqahId: string, duaId: string) =>
    api.post(`/api/v1/halaqah/${halaqahId}/duas/${duaId}/pray`),
  sendNaseeha: (id: string, text: string) =>
    api.post(`/api/v1/halaqah/${id}/naseeha`, { text }),
};

// ─── AI ──────────────────────────────────────────────────────
export const aiApi = {
  planDay: () =>
    api.post<import("../../shared/types").AIDayPlan>("/api/v1/ai/plan-day"),
  weeklyReview: () =>
    api.post<import("../../shared/types").AIWeeklyReview>("/api/v1/ai/weekly-review"),
  studyStrategy: () =>
    api.post<any>("/api/v1/ai/study-strategy"),
  financeInsights: () =>
    api.post<any>("/api/v1/ai/finance-insights"),
  chat: (message: string, history: import("../../shared/types").ChatMessage[]) =>
    api.post<{ reply: string }>("/api/v1/ai/coach", { message, history }),
};

// ─── Intelligence ────────────────────────────────────────────
export const intelligenceApi = {
  getDashboard: () =>
    api.get<import("../../shared/types").DashboardIntelligence>("/api/v1/intelligence/dashboard"),
};

// ─── Subscription ────────────────────────────────────────────
export const subscriptionApi = {
  get: () =>
    api.get<import("../../shared/types").Subscription>("/api/v1/subscription"),
  getUsage: () =>
    api.get<import("../../shared/types").Usage>("/api/v1/subscription/usage"),
};
