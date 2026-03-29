// ============================================================
// SHARED CONSTANTS - used by Web, Flutter, and Backend
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

export const TASK_TYPE_COLORS: Record<string, string> = {
  work: COLORS.INFO,
  freelance: COLORS.SUCCESS,
  study: COLORS.PURPLE,
  personal: COLORS.WARNING,
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
};

export const EXPENSE_CATEGORIES = ['طعام', 'مواصلات', 'فواتير', 'ترفيه', 'ملابس', 'صحة', 'تعليم', 'أخرى'];
export const INCOME_CATEGORIES = ['مرتب', 'فريلانس', 'هدية', 'أخرى'];
export const WISHLIST_CATEGORIES = ['tech', 'ملابس', 'كتب', 'رياضة', 'سفر', 'أخرى'];
