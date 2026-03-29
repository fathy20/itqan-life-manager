// ============================================================
// SHARED TYPES - used by Web (React), Flutter, and Backend
// ============================================================

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'on-hold';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type HabitCategory = 'spiritual' | 'health' | 'study' | 'work' | 'personal';
export type TaskType = 'work' | 'freelance' | 'study' | 'personal';
export type ProjectType = 'work' | 'freelance';
export type TransactionType = 'income' | 'expense';
export type CommitmentType = 'installment' | 'jam-eya' | 'subscription' | 'other';

// ── Profile ──────────────────────────────────────────────────
export interface Profile {
  name: string;
  university?: string;
  faculty?: string;
  program?: string;
  level?: string;
  semester?: string;
  role?: string;
  timezone: string;
  locale: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Subject ──────────────────────────────────────────────────
export interface Subject {
  id: string;
  name: string;
  examDate: string;
  examTime?: { start: string; end: string };
  totalLectures: number;
  completedLectures: number;
  difficulty: Difficulty;
  color: string;
  carryover?: boolean;
  isPending?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Task ─────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  type: TaskType;
  priority: Priority;
  status: TaskStatus;
  deadline?: string;
  dueDate?: string;
  estimatedMinutes?: number;
  focusType?: 'deep' | 'medium' | 'light';
  completedAt?: string;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Project ──────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  client?: string;
  type: ProjectType;
  priority: Priority;
  status: 'ongoing' | 'completed' | 'on-hold';
  color: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Course ───────────────────────────────────────────────────
export interface Course {
  id: string;
  name: string;
  platform: string;
  totalHours: number;
  completedHours: number;
  weeklyGoalHours: number;
  color: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Finance ──────────────────────────────────────────────────
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  priority: Priority;
  category: string;
  link?: string;
  savedAmount: number;
  status: 'pending' | 'bought';
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialCommitment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: CommitmentType;
  totalInstallments?: number;
  paidInstallments?: number;
  status: 'active' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

// ── Habit ────────────────────────────────────────────────────
export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Lifestyle ────────────────────────────────────────────────
export interface LifestyleLog {
  date: string;
  sleepHours: number;
  wakeUpTime: string;
  phoneUsageMinutes: number;
  phonePickups: number;
  waterIntake: number;
  steps: number;
  mood?: 'great' | 'good' | 'neutral' | 'bad';
  notes?: string;
}

// ── Focus Session ────────────────────────────────────────────
export interface FocusSession {
  id: string;
  startTime: string;
  durationMinutes: number;
  type: 'pomodoro' | 'deep-work';
  taskId?: string;
  createdAt?: string;
}

// ── API Response wrappers ────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

export interface ApiError {
  error: string;
  code?: string;
  statusCode?: number;
}
