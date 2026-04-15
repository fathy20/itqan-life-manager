// ============================================================
// SHARED CONSTANTS - used by Web, Flutter, and Backend
// Aligned with new interfaces (types/new.ts)
// ============================================================

export const API_VERSION = 'v1';
export const API_BASE = `/api/${API_VERSION}`;

export const ROUTES = {
  AUTH: {
    ME: `${API_BASE}/auth/me`,
    LOGOUT: `${API_BASE}/auth/logout`,
  },
  PROFILE: `${API_BASE}/profile`,
  SUBJECTS: `${API_BASE}/subjects`,
  TASKS: `${API_BASE}/tasks`,
  PROJECTS: `${API_BASE}/projects`,
  COURSES: `${API_BASE}/courses`,
  FINANCE: {
    TRANSACTIONS: `${API_BASE}/finance/transactions`,
    WISHLIST: `${API_BASE}/finance/wishlist`,
    COMMITMENTS: `${API_BASE}/finance/commitments`,
    SALARY: `${API_BASE}/finance/salary`,
  },
  HABITS: `${API_BASE}/habits`,
  LIFESTYLE: `${API_BASE}/lifestyle`,
  FOCUS: `${API_BASE}/focus`,
  // Islamic modules
  SALAH: `${API_BASE}/salah`,
  QURAN: `${API_BASE}/quran`,
  ADHKAR: `${API_BASE}/adhkar`,
  SCORE: `${API_BASE}/score`,
  FASTING: `${API_BASE}/fasting`,
  HALAQAH: `${API_BASE}/halaqah`,
  AI: `${API_BASE}/ai`,
  INTELLIGENCE: `${API_BASE}/intelligence`,
  SUBSCRIPTION: `${API_BASE}/subscription`,
} as const;

export const COLORS = {
  BRAND: '#0ea5e9',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  CYAN: '#06b6d4',
  ORANGE: '#f97316',
} as const;

export const SUBJECT_COLORS = Object.values(COLORS);

// New interface: task.type uses 'job' instead of 'work', adds 'worship','health'
export const TASK_TYPE_COLORS: Record<string, string> = {
  job: COLORS.INFO,
  freelance: COLORS.SUCCESS,
  study: COLORS.PURPLE,
  personal: COLORS.WARNING,
  worship: COLORS.CYAN,
  health: COLORS.PINK,
};

// New interface: difficulty is number 1-5
export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'سهل جداً',
  2: 'سهل',
  3: 'متوسط',
  4: 'صعب',
  5: 'صعب جداً',
};

export const FOCUS_LEVEL_LABELS: Record<string, string> = {
  deep: 'تركيز عميق',
  medium: 'تركيز متوسط',
  light: 'تركيز خفيف',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  completed: 'مكتمل',
  paused: 'متوقف',
};

export const EXPENSE_CATEGORIES = ['طعام', 'مواصلات', 'فواتير', 'ترفيه', 'ملابس', 'صحة', 'تعليم', 'أخرى'];
export const INCOME_CATEGORIES = ['مرتب', 'فريلانس', 'هدية', 'أخرى'];
export const SADAQAH_CATEGORIES = ['صدقة', 'زكاة', 'كفارة', 'أخرى'];
export const WISHLIST_CATEGORIES = ['tech', 'ملابس', 'كتب', 'رياضة', 'سفر', 'أخرى'];

export const COMMITMENT_TYPE_LABELS: Record<string, string> = {
  installment: 'قسط',
  savings_group: 'جمعية',
};
