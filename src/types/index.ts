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
  subjects: any[];
  tasks: any[];
  projects: any[];
  courses: any[];
  transactions: any[];
  wishlist: any[];
  commitments: any[];
  monthlySalary: number;
  habits: any[];
  lifestyleLogs: any[];
  focusSessions: any[];
}
