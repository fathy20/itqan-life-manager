// ═══════════════════════════════════════════════════════════════
//  src/hooks/index.ts
//  Custom React Hooks — connect each screen to the backend
//  Pattern: useModule() → { data, loading, error, actions }
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  salahApi, quranApi, adhkarApi, studyApi, workApi,
  financeApi, lifestyleApi, focusApi, scoreApi,
  halaqahApi, aiApi, intelligenceApi, profileApi,
  subscriptionApi, fastingApi, zakatApi,
} from "../lib/api";
import type {
  DayPrayerLog, PrayerTimes, PrayerName, PrayerStatus,
  KhatmaPlan, SurahHifz, DayAdhkarLog, Subject, Task,
  Project, Course, Transaction, WishlistItem, Commitment,
  Habit, LifestyleLog, FocusSession, DailyScore, SharedScore,
  Halaqah, DuaRequest, ChatMessage, DashboardIntelligence,
  UserProfile, Subscription, Usage, FastingDay, FastingQada,
} from "../../shared/types";

// ─── Generic Fetch Hook ──────────────────────────────────────

function useApi<T>(fetcher: () => Promise<{ success: boolean; data?: T }>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetcher();
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError((res as any).message || "Failed to fetch");
    }
    setLoading(false);
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch, setData };
}

// ─── Helper: today's date ────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

// ═══════════════════════════════════════════════════════════════
//  HOOKS PER MODULE
// ═══════════════════════════════════════════════════════════════

// ─── Profile ─────────────────────────────────────────────────
export function useProfile() {
  const { data: profile, loading, error, refetch } = useApi<UserProfile>(
    () => profileApi.get(),
  );

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const res = await profileApi.update(updates);
    if (res.success) refetch();
    return res;
  };

  return { profile, loading, error, updateProfile, refetch };
}

// ─── Subscription ────────────────────────────────────────────
export function useSubscription() {
  const { data: subscription, loading: subLoading } = useApi<Subscription>(
    () => subscriptionApi.get(),
  );
  const { data: usage, loading: usageLoading, refetch: refetchUsage } = useApi<Usage>(
    () => subscriptionApi.getUsage(),
  );

  const canAccess = (feature: string): boolean => {
    if (!subscription) return false;
    const plan = subscription.planType;
    const gates: Record<string, string[]> = {
      aiDailyPlan: ["pro", "premium"],
      aiWeeklyReview: ["pro", "premium"],
      aiStudyStrategy: ["premium"],
      aiFinanceInsights: ["premium"],
      advancedAnalytics: ["pro", "premium"],
      dataExport: ["pro", "premium"],
    };
    return gates[feature]?.includes(plan) ?? true;
  };

  return {
    subscription, usage,
    loading: subLoading || usageLoading,
    canAccess, refetchUsage,
    plan: subscription?.planType || "free",
  };
}

// ─── Salah ───────────────────────────────────────────────────
export function useSalah(date = today()) {
  const { data: prayerLog, loading, refetch } = useApi<DayPrayerLog>(
    () => salahApi.getLog(date), [date],
  );
  const [times, setTimes] = useState<PrayerTimes | null>(null);

  // Fetch prayer times based on user location
  const fetchTimes = async (lat: number, lng: number, method = 5) => {
    const res = await salahApi.getTimes(lat, lng, method);
    if (res.success && res.data) setTimes(res.data);
  };

  const logPrayer = async (
    prayer: PrayerName,
    status: PrayerStatus,
    options?: { jamaah?: boolean; sunnahBefore?: boolean; sunnahAfter?: boolean }
  ) => {
    const res = await salahApi.logPrayer({ date, prayer, status, ...options });
    if (res.success) refetch();
    return res;
  };

  const logExtra = async (type: "witr" | "qiyam" | "duha", done: boolean) => {
    const res = await salahApi.logExtra({ date, type, done });
    if (res.success) refetch();
    return res;
  };

  const { data: stats } = useApi(() => salahApi.getStats("week"));
  const { data: qada, refetch: refetchQada } = useApi(() => salahApi.getQada());

  const updateQada = async (delta: number) => {
    const res = await salahApi.updateQada(delta);
    if (res.success) refetchQada();
    return res;
  };

  return { prayerLog, times, loading, fetchTimes, logPrayer, logExtra, stats, qada, updateQada, refetch };
}

// ─── Quran ───────────────────────────────────────────────────
export function useQuran() {
  const { data: plans, refetch: refetchPlans } = useApi<KhatmaPlan[]>(() => quranApi.getPlans());
  const { data: hifz, refetch: refetchHifz } = useApi<SurahHifz[]>(() => quranApi.getHifz());
  const { data: reviewsDue, refetch: refetchReviews } = useApi<SurahHifz[]>(() => quranApi.getReviewsDue());
  const { data: stats } = useApi(() => quranApi.getStats());

  const activePlan = plans?.find(p => p.status === "active") || null;

  const logReading = async (pages: number, type: "reading" | "hifz" | "review" = "reading") => {
    const res = await quranApi.logSession({ type, fromPage: 0, toPage: pages, date: today() });
    if (res.success) { refetchPlans(); refetchReviews(); }
    return res;
  };

  const updateHifzStatus = async (surahNum: number, data: Partial<SurahHifz>) => {
    const res = await quranApi.updateHifz(surahNum, data);
    if (res.success) refetchHifz();
    return res;
  };

  return { plans, activePlan, hifz, reviewsDue, stats, logReading, updateHifzStatus, refetchPlans };
}

// ─── Adhkar ──────────────────────────────────────────────────
export function useAdhkar() {
  const { data: todayLog, loading, refetch } = useApi<DayAdhkarLog>(() => adhkarApi.getToday());

  const logBlock = async (block: "morning" | "evening" | "sleep" | "afterPrayer") => {
    const res = await adhkarApi.logBlock(block);
    if (res.success) refetch();
    return res;
  };

  const updateCounter = async (counter: string, value: number) => {
    const res = await adhkarApi.updateCounter(counter, value);
    if (res.success) refetch();
    return res;
  };

  const { data: stats } = useApi(() => adhkarApi.getStats("week"));

  return { todayLog, loading, logBlock, updateCounter, stats, refetch };
}

// ─── Fasting ─────────────────────────────────────────────────
export function useFasting(year: number, month: number) {
  const { data: days, refetch } = useApi<FastingDay[]>(
    () => fastingApi.getMonth(year, month), [year, month],
  );
  const { data: qada, refetch: refetchQada } = useApi<FastingQada>(() => fastingApi.getQada());
  const { data: suggestions } = useApi(() => fastingApi.getSuggestions());

  const logFast = async (date: string, type: string, completed: boolean) => {
    const res = await fastingApi.logDay({ date, type: type as any, completed });
    if (res.success) refetch();
    return res;
  };

  return { days, qada, suggestions, logFast, refetch, refetchQada };
}

// ─── Study ───────────────────────────────────────────────────
export function useStudy() {
  const { data: subjects, loading, refetch } = useApi<Subject[]>(() => studyApi.getSubjects());

  const addSubject = async (data: Omit<Subject, "id" | "createdAt" | "updatedAt">) => {
    const res = await studyApi.createSubject(data);
    if (res.success) refetch();
    return res;
  };

  const updateSubject = async (id: string, data: Partial<Subject>) => {
    const res = await studyApi.updateSubject(id, data);
    if (res.success) refetch();
    return res;
  };

  const deleteSubject = async (id: string) => {
    const res = await studyApi.deleteSubject(id);
    if (res.success) refetch();
    return res;
  };

  // Computed
  const nextExam = subjects?.reduce((a, b) =>
    new Date(a.examDate) < new Date(b.examDate) ? a : b
  , subjects?.[0]) || null;

  const dangerSubjects = subjects?.filter(s => {
    const daysLeft = Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000);
    const lecturesLeft = s.totalLectures - s.completedLectures;
    return daysLeft > 0 && (lecturesLeft / daysLeft) > 3;
  }) || [];

  return { subjects, loading, addSubject, updateSubject, deleteSubject, nextExam, dangerSubjects, refetch };
}

// ─── Work ────────────────────────────────────────────────────
export function useWork() {
  const { data: tasks, loading: tasksLoading, refetch: refetchTasks } = useApi<Task[]>(() => workApi.getTasks());
  const { data: projects, refetch: refetchProjects } = useApi<Project[]>(() => workApi.getProjects());
  const { data: courses, refetch: refetchCourses } = useApi<Course[]>(() => workApi.getCourses());

  const addTask = async (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const res = await workApi.createTask(data);
    if (res.success) refetchTasks();
    return res;
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const res = await workApi.updateTask(id, {
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    });
    if (res.success) refetchTasks();
    return res;
  };

  const deleteTask = async (id: string) => {
    const res = await workApi.deleteTask(id);
    if (res.success) refetchTasks();
    return res;
  };

  return {
    tasks, projects, courses,
    loading: tasksLoading,
    addTask, toggleTask, deleteTask,
    refetchTasks, refetchProjects, refetchCourses,
  };
}

// ─── Finance ─────────────────────────────────────────────────
export function useFinance() {
  const { data: transactions, refetch: refetchTx } = useApi<Transaction[]>(() => financeApi.getTransactions());
  const { data: wishlist, refetch: refetchWl } = useApi<WishlistItem[]>(() => financeApi.getWishlist());
  const { data: commitments } = useApi<Commitment[]>(() => financeApi.getCommitments());

  const addTransaction = async (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
    const res = await financeApi.createTransaction(data);
    if (res.success) refetchTx();
    return res;
  };

  // Computed
  const income = transactions?.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0) || 0;
  const expenses = transactions?.filter(t => t.type === "expense").reduce((a, b) => a + Math.abs(b.amount), 0) || 0;
  const sadaqah = transactions?.filter(t => t.type === "sadaqah").reduce((a, b) => a + Math.abs(b.amount), 0) || 0;
  const balance = income - expenses - sadaqah;

  return { transactions, wishlist, commitments, balance, income, expenses, sadaqah, addTransaction, refetchTx };
}

// ─── Lifestyle ───────────────────────────────────────────────
export function useLifestyle() {
  const { data: habits, loading, refetch: refetchHabits } = useApi<Habit[]>(() => lifestyleApi.getHabits());
  const { data: logs } = useApi<LifestyleLog[]>(() => lifestyleApi.getLogs());

  const addHabit = async (name: string, nameAr?: string) => {
    const res = await lifestyleApi.createHabit({ name, nameAr });
    if (res.success) refetchHabits();
    return res;
  };

  const toggleHabit = async (id: string) => {
    const res = await lifestyleApi.toggleHabit(id, today());
    if (res.success) refetchHabits();
    return res;
  };

  const logDay = async (data: Omit<LifestyleLog, "createdAt">) => {
    return lifestyleApi.logDay(data);
  };

  const todayLog = logs?.find(l => l.date === today()) || null;

  return { habits, logs, todayLog, loading, addHabit, toggleHabit, logDay, refetchHabits };
}

// ─── Focus ───────────────────────────────────────────────────
export function useFocus() {
  const { data: sessions, refetch } = useApi<FocusSession[]>(() => focusApi.getSessions());

  const logSession = async (data: Omit<FocusSession, "id" | "createdAt">) => {
    const res = await focusApi.logSession(data);
    if (res.success) refetch();
    return res;
  };

  const todaySessions = sessions?.filter(s =>
    s.completedAt.startsWith(today())
  ) || [];

  const totalMinutesToday = todaySessions.reduce((a, b) => a + b.duration, 0);

  return { sessions, todaySessions, totalMinutesToday, logSession, refetch };
}

// ─── Score ───────────────────────────────────────────────────
export function useScore() {
  const { data: todayScore, loading, refetch } = useApi<DailyScore>(() => scoreApi.getToday());
  const { data: weekScores } = useApi<DailyScore[]>(() => scoreApi.getWeek());
  const { data: shared } = useApi<SharedScore>(() => scoreApi.getShared());

  const weekAvg = weekScores
    ? Math.round(weekScores.reduce((a, b) => a + b.total, 0) / weekScores.length)
    : 0;

  return { todayScore, weekScores, shared, weekAvg, loading, refetch };
}

// ─── Halaqah / Sibaq ─────────────────────────────────────────
export function useHalaqah(halaqahId?: string) {
  const { data: halaqat, refetch: refetchAll } = useApi<Halaqah[]>(() => halaqahApi.getAll());

  const activeHalaqah = halaqahId
    ? halaqat?.find(h => h.id === halaqahId)
    : halaqat?.[0] || null;

  const { data: leaderboard, refetch: refetchBoard } = useApi(
    () => activeHalaqah?.id ? halaqahApi.getLeaderboard(activeHalaqah.id) : Promise.resolve({ success: true, data: [] }),
    [activeHalaqah?.id],
  );

  const { data: duas, refetch: refetchDuas } = useApi(
    () => activeHalaqah?.id ? halaqahApi.getDuas(activeHalaqah.id) : Promise.resolve({ success: true, data: [] }),
    [activeHalaqah?.id],
  );

  const join = async (code: string) => {
    const res = await halaqahApi.join(code);
    if (res.success) refetchAll();
    return res;
  };

  const create = async (name: string) => {
    const res = await halaqahApi.create({ name });
    if (res.success) refetchAll();
    return res;
  };

  const addDua = async (text: string) => {
    if (!activeHalaqah?.id) return;
    const res = await halaqahApi.addDua(activeHalaqah.id, text);
    if (res.success) refetchDuas();
    return res;
  };

  const prayForDua = async (duaId: string) => {
    if (!activeHalaqah?.id) return;
    return halaqahApi.prayForDua(activeHalaqah.id, duaId);
  };

  const completeChallenge = async () => {
    if (!activeHalaqah?.id) return;
    return halaqahApi.completeChallenge(activeHalaqah.id);
  };

  return {
    halaqat, activeHalaqah, leaderboard, duas,
    join, create, addDua, prayForDua, completeChallenge,
    refetchBoard, refetchDuas,
  };
}

// ─── AI Coach ────────────────────────────────────────────────
export function useAICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const res = await aiApi.chat(text, messages);
    setLoading(false);

    if (res.success && res.data) {
      const assistantMsg: ChatMessage = {
        role: "assistant",
        text: res.data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    }

    return res;
  };

  const planDay = async () => {
    setLoading(true);
    const res = await aiApi.planDay();
    setLoading(false);
    return res;
  };

  const weeklyReview = async () => {
    setLoading(true);
    const res = await aiApi.weeklyReview();
    setLoading(false);
    return res;
  };

  return { messages, loading, send, planDay, weeklyReview };
}

// ─── Intelligence (Dashboard) ────────────────────────────────
export function useIntelligence() {
  const { data: intelligence, loading, refetch } = useApi<DashboardIntelligence>(
    () => intelligenceApi.getDashboard(),
  );
  return { intelligence, loading, refetch };
}
