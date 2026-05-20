// ═══════════════════════════════════════════════════════════════
//  src/types/index.ts
//  DEPRECATED — use src/types/new.ts instead
//  Kept as re-export for backward compatibility during migration
//  All new screens should import from './new'
// ═══════════════════════════════════════════════════════════════

// Re-export everything from new types
export type {
  Subject,
  Task,
  TaskType,
  FocusLevel,
  Project,
  Course,
  Transaction,
  TransactionType,
  WishlistItem,
  Commitment,
  Habit,
  LifestyleLog,
  FocusSession,
  // Islamic types
  PrayerName,
  PrayerStatus,
  PrayerLog,
  DayPrayerLog,
  PrayerTimes,
  PrayerStats,
  QuranSession,
  KhatmaPlan,
  SurahHifz,
  DayAdhkarLog,
  AdhkarStats,
  FastingDay,
  FastingQada,
  FastingType,
  DailyScore,
  SharedScore,
  RankTitle,
  // Auth & profile
  UserProfile,
  Subscription,
  Usage,
  ApiResponse,
  PaginatedResponse,
  // AI
  AIDayPlan,
  AIWeeklyReview,
  ChatMessage,
  // Intelligence
  DashboardIntelligence,
  // Halaqah
  Halaqah,
  HalaqahChallenge,
  HalaqahLeaderboardEntry,
  HalaqahSummary,
  HalaqahSettings,
  DuaRequest,
  // Zakat
  ZakatAssets,
  ZakatCalculation,
} from './new';

// Legacy type aliases for backward compatibility
/** @deprecated Use TaskType from './new' instead */
export type Priority = 'low' | 'medium' | 'high';
/** @deprecated Use Task.completed (boolean) instead */
export type Status = 'todo' | 'in-progress' | 'completed' | 'on-hold';

export interface LegacySubject {
  id: string;
  name: string;
  color?: string;
  examDate?: string;
  examTime?: string | { start: string; end: string };
  difficulty?: number | string;
  totalLectures?: number;
  completedLectures?: number;
  carryover?: boolean;
  isPending?: boolean;
  notes?: string;
}

export interface LegacyTask {
  id: string;
  title: string;
  type: string;
  status?: Status;
  priority?: Priority;
  color?: string;
  completed?: boolean;
  focusLevel?: string;
  focusType?: string;
  estimatedMinutes?: number;
  projectId?: string;
  dueDate?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegacyProject {
  id: string;
  name: string;
  type?: string;
  client?: string;
  priority?: Priority;
  color?: string;
  progress?: number;
  status: string;
  deadline?: string;
}

export interface LegacyCourse {
  id: string;
  name: string;
  platform?: string;
  totalHours?: number;
  completedHours?: number;
  weeklyGoalHours?: number;
  color?: string;
  totalLessons?: number;
  completedLessons?: number;
  progress?: number;
  status?: string;
}

export interface LegacyTransaction {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
}

export interface LegacyWishlistItem {
  id: string;
  name: string;
  price: number;
  savedAmount: number;
  priority: Priority;
}

export interface LegacyCommitment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type?: string;
}

export interface LegacyHabit {
  id: string;
  name: string;
  category?: string;
  frequency?: string;
  streak: number;
  completedDates: string[];
  icon?: string;
}

export interface LegacyLifestyleLog {
  date: string;
  sleepHours?: number;
  phoneHours?: number;
  waterLiters?: number;
  steps?: number;
  wakeUpTime?: string;
}

export interface LegacyFocusSession {
  id: string;
  duration: number;
  type: string;
  label?: string;
  completedAt?: string;
}

// Legacy AppState — kept for screens still using it
/** @deprecated Migrate to individual hooks (useSalahNew, useQuranNew, etc.) */
export interface AppState {
  profile: {
    name: string;
    university: string;
    faculty: string;
    program: string;
    level: string;
    semester: string;
    role: string;
    onboardingCompleted?: boolean;
    timezone: string;
    locale: string;
  };
  context: {
    focusAreas: string[];
    companyProject: string;
    freelanceTypes: string[];
  };
  telegram: {
    enabled: boolean;
    style: string;
    preferences: {
      morningMessage: boolean;
      prayerReminders: boolean;
      studyPush: boolean;
      celebrateWins: boolean;
      checkOnMissedTasks: boolean;
    };
  };
  calendarContext: {
    country: string;
    city: string;
    ramadanMode: 'auto' | 'manual';
    eidMode: 'auto' | 'manual';
  };
  subjects: LegacySubject[];
  tasks: LegacyTask[];
  projects: LegacyProject[];
  courses: LegacyCourse[];
  transactions: LegacyTransaction[];
  wishlist: LegacyWishlistItem[];
  commitments: LegacyCommitment[];
  monthlySalary: number;
  habits: LegacyHabit[];
  lifestyleLogs: LegacyLifestyleLog[];
  focusSessions: LegacyFocusSession[];
}
