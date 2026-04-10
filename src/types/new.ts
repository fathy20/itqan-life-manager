// ═══════════════════════════════════════════════════════════════
//  src/types/new.ts
//  NEW types — source of truth from interface/index.ts
//  Used by: new interface screens only (Salah slice first)
//  DO NOT import from this file in legacy screens
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// ─── Auth & Profile ──────────────────────────────────────────
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: "student" | "employee" | "freelancer";
  university?: string;
  onboardingCompleted: boolean;
  financePIN?: string;
  language: "ar" | "en";
  timezone: string;
  location?: { lat: number; lng: number; city: string };
  prayerMethod: number;
  madhab?: "hanafi" | "maliki" | "shafii" | "hanbali";
  createdAt: string;
  updatedAt: string;
}

// ─── Prayer / Salah ──────────────────────────────────────────
export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type PrayerStatus = "onTime" | "late" | "qada" | "missed" | "pending";

export interface PrayerLog {
  prayer: PrayerName;
  status: PrayerStatus;
  jamaah: boolean;
  sunnahBefore?: boolean;
  sunnahAfter?: boolean;
  loggedAt?: string;
}

export interface DayPrayerLog {
  date: string;
  prayers: Record<PrayerName, PrayerLog>;
  witr: boolean;
  qiyam: boolean;
  duha: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

export interface PrayerStats {
  onTimeRate: number;
  jamaahRate: number;
  totalPrayed: number;
  totalOnTime: number;
  totalJamaah: number;
  period: "week" | "month";
}

// ─── Subscription ────────────────────────────────────────────
export type PlanType = "free" | "pro" | "premium";
export type PlanStatus = "active" | "trialing" | "past_due" | "canceled";

export interface Subscription {
  planType: PlanType;
  status: PlanStatus;
  trialEndDate?: string;
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Usage {
  aiRequestsToday: number;
  aiRequestsResetAt: string;
  focusSessionsThisWeek: number;
  completedTasksThisWeek: number;
  weekResetAt: string;
  updatedAt: string;
}

// ─── Quran ───────────────────────────────────────────────────
export type QuranActivityType = "reading" | "hifz" | "review";
export type HifzStatus = "not_started" | "in_progress" | "memorized" | "needs_review";

export interface QuranSession {
  id?: string;
  type: QuranActivityType;
  fromPage?: number;
  toPage?: number;
  surah?: number;
  fromAyah?: number;
  toAyah?: number;
  durationMinutes?: number;
  date: string;
  createdAt: string;
}

export interface KhatmaPlan {
  id?: string;
  targetDays: number;
  dailyPages: number;
  currentPage: number;
  totalPages: number;
  startDate: string;
  targetDate: string;
  completedDates: string[];
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface SurahHifz {
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  memorizedAyahs: number;
  status: HifzStatus;
  lastReviewDate?: string;
  nextReviewDate?: string;
  reviewCount: number;
  updatedAt: string;
}

// ─── Adhkar ──────────────────────────────────────────────────
export interface DayAdhkarLog {
  date: string;
  morning: { completed: boolean; completedAt?: string };
  evening: { completed: boolean; completedAt?: string };
  afterPrayer: { count: number };
  sleep: { completed: boolean };
  istighfar: number;
  salawat: number;
  customCounters: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface AdhkarStats {
  completionRate: number;
  streak: number;
  morningRate: number;
  eveningRate: number;
  sleepRate: number;
  afterPrayerRate: number;
  period: 'week' | 'month';
}

// ─── Fasting ─────────────────────────────────────────────────
export type FastingType =
  | "ramadan" | "monday_thursday" | "ayyam_beed"
  | "arafah" | "ashura" | "shawwal" | "qada" | "voluntary";

export interface FastingDay {
  date: string;
  type: FastingType;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface FastingQada {
  totalOwed: number;
  completed: number;
  remaining: number;
  updatedAt: string;
}

// ─── Zakat ───────────────────────────────────────────────────
export interface ZakatAssets {
  cash: number;
  goldGrams: number;
  silverGrams: number;
  stocks: number;
  businessInventory: number;
  debtsOwedToYou: number;
}

export interface ZakatCalculation {
  year: number;
  assets: ZakatAssets;
  liabilities: { debtsYouOwe: number };
  totalZakatable: number;
  nisabMet: boolean;
  zakatDue: number;
  zakatPaid: number;
  status: "pending" | "paid" | "partial";
  hawlDate: string;
}

// ─── Study ───────────────────────────────────────────────────
export interface Subject {
  id?: string;
  name: string;
  nameAr?: string;
  examDate: string;
  difficulty: number; // 1-5 (NOT "easy"|"medium"|"hard")
  totalLectures: number;
  completedLectures: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Work ────────────────────────────────────────────────────
export type TaskType = "job" | "freelance" | "study" | "personal" | "worship" | "health";
export type FocusLevel = "deep" | "medium" | "light";

export interface Task {
  id?: string;
  title: string;
  type: TaskType;
  focusLevel: FocusLevel;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id?: string;
  name: string;
  client?: string;
  deadline?: string;
  progress: number;
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id?: string;
  name: string;
  platform?: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
}

// ─── Finance ─────────────────────────────────────────────────
export type TransactionType = "income" | "expense" | "sadaqah";

export interface Transaction {
  id?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id?: string;
  name: string;
  price: number;
  savedAmount: number;
  priority: "high" | "medium" | "low";
  createdAt: string;
  updatedAt: string;
}

export interface Commitment {
  id?: string;
  name: string;
  type: "installment" | "savings_group";
  amount: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Lifestyle ───────────────────────────────────────────────
export interface Habit {
  id?: string;
  name: string;
  nameAr?: string;
  icon?: string;
  completedDates: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LifestyleLog {
  date: string;
  sleepHours: number;
  phoneHours: number;
  waterLiters: number;
  steps: number;
  exercise?: { type: string; durationMinutes: number };
  createdAt: string;
}

// ─── Focus ───────────────────────────────────────────────────
export interface FocusSession {
  id?: string;
  duration: number;
  type: "study" | "work" | "quran" | "other";
  label?: string;
  completedAt: string;
  linkedTaskId?: string;
  createdAt: string;
}

// ─── Score ───────────────────────────────────────────────────
export interface DailyScore {
  date: string;
  salah: number;
  quran: number;
  adhkar: number;
  productivity: number;
  health: number;
  bonus: number;
  total: number;
  createdAt: string;
}

export type RankTitle = "مبتدئ" | "سالك" | "مجتهد" | "محسن" | "متقن";

export interface SharedScore {
  weekId: string;
  rankTitle: RankTitle;
  weeklyRingPercent: number;
  streakDays: number;
  updatedAt: string;
}

// ─── Halaqah ─────────────────────────────────────────────────
export interface Halaqah {
  id?: string;
  name: string;
  createdBy: string;
  inviteCode: string;
  maxMembers: number;
  members: string[];
  currentChallenge?: HalaqahChallenge;
  settings: HalaqahSettings;
  createdAt: string;
  updatedAt: string;
}

export interface HalaqahChallenge {
  id: string;
  description: string;
  descriptionAr?: string;
  startDate: string;
  endDate: string;
  type: 'adhkar' | 'quran' | 'fasting' | 'salah' | 'custom';
  completedCount: number;
  totalMembers: number;
}

export interface HalaqahLeaderboardEntry {
  displayName: string;
  rankTitle: string;
  weeklyRingPercent: number;
  streakDays: number;
}

export interface HalaqahSummary {
  id: string;
  name: string;
  memberCount: number;
  inviteCode: string;
  createdBy: boolean;
}

export interface HalaqahSettings {
  showStreaks: boolean;
  showRanks: boolean;
  showWeeklyRing: boolean;
  enableDuaWall: boolean;
  enableNaseeha: boolean;
  challengeFrequency: "weekly" | "biweekly";
}

export interface DuaRequest {
  id?: string;
  text: string;
  isAnonymous: true;
  duaCount: number;
  createdAt: string;
}

// ─── AI ──────────────────────────────────────────────────────
export interface AIDayPlan {
  fajr: { time: string; tasks: string[] };
  morning: { tasks: string[] };
  dhuhr: { time: string; tasks: string[] };
  afternoon: { tasks: string[] };
  asr: { time: string; tasks: string[] };
  preMaghrib: { tasks: string[] };
  maghrib: { time: string; tasks: string[] };
  evening: { tasks: string[] };
  isha: { time: string; tasks: string[] };
  beforeSleep: { tasks: string[] };
}

export interface AIWeeklyReview {
  tasksCompleted: number;
  completionRate: number;
  prayerOnTimeRate: number;
  quranPagesRead: number;
  weeklyScore: number;
  topAchievement: string;
  biggestChallenge: string;
  nextWeekRecommendations: string[];
  encouragement: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

// ─── Intelligence ────────────────────────────────────────────
export interface DashboardIntelligence {
  lifeScore: number;
  burnout: { level: "low" | "medium" | "high"; signals: string[] };
  examRisks: { subject: string; risk: "safe" | "warning" | "danger"; reason: string }[];
  financeRisk: { score: number; alerts: string[] };
  habitConsistency: { overall: number; habits: { name: string; rate: number; streak: number }[] };
  topPriorities: { type: string; title: string; urgency: number; action: string }[];
}
