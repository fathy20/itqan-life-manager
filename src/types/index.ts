export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed' | 'on-hold';

export interface Subject {
  id: string;
  name: string;
  examDate: string;
  examTime?: { start: string; end: string };
  totalLectures: number;
  completedLectures: number;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
  carryover?: boolean;
  isPending?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  type: 'work' | 'freelance' | 'study' | 'personal';
  priority: Priority;
  status: Status;
  deadline?: string;
  dueDate?: string;
  estimatedMinutes?: number;
  focusType?: 'deep' | 'medium' | 'light';
  completedAt?: string;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  client?: string;
  type: 'work' | 'freelance';
  priority: Priority;
  status: 'ongoing' | 'completed' | 'on-hold';
  color: string;
}

export interface Course {
  id: string;
  name: string;
  platform: string;
  totalHours: number;
  completedHours: number;
  weeklyGoalHours: number;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
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
}

export interface FinancialCommitment {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date
  type: 'installment' | 'jam-eya' | 'subscription' | 'other';
  totalInstallments?: number;
  paidInstallments?: number;
  status: 'active' | 'completed';
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: 'spiritual' | 'health' | 'study' | 'work' | 'personal';
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: string[]; // ISO strings
}

export interface LifestyleLog {
  date: string;
  sleepHours: number;
  wakeUpTime: string;
  phoneUsageMinutes: number;
  phonePickups: number;
  waterIntake: number; // glasses
  steps: number;
}

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
  subjects: Subject[];
  tasks: Task[];
  projects: Project[];
  courses: Course[];
  transactions: Transaction[];
  wishlist: WishlistItem[];
  commitments: FinancialCommitment[];
  monthlySalary: number;
  habits: Habit[];
  lifestyleLogs: LifestyleLog[];
  focusSessions: {
    id: string;
    startTime: string;
    durationMinutes: number;
    type: 'pomodoro' | 'deep-work';
    taskId?: string;
  }[];
}
