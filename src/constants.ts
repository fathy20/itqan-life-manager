import { AppState } from './types';

// ===== EMPTY STATE for new users =====
export const EMPTY_STATE: AppState = {
  profile: {
    name: '',
    university: '',
    faculty: '',
    program: '',
    level: '',
    semester: '',
    role: '',
    timezone: 'Africa/Cairo',
    locale: 'ar-EG',
  },
  context: {
    focusAreas: [],
    companyProject: '',
    freelanceTypes: [],
  },
  telegram: {
    enabled: false,
    style: 'coach_friend',
    preferences: {
      morningMessage: true,
      prayerReminders: true,
      studyPush: true,
      celebrateWins: true,
      checkOnMissedTasks: true,
    },
  },
  calendarContext: {
    country: 'Egypt',
    city: 'Cairo',
    ramadanMode: 'auto',
    eidMode: 'auto',
  },
  subjects: [],
  tasks: [],
  projects: [],
  courses: [],
  transactions: [],
  wishlist: [],
  commitments: [],
  monthlySalary: 0,
  habits: [
    { id: 'h1', name: 'ورد يومي', icon: '📖', category: 'spiritual', frequency: 'daily', streak: 0, completedDates: [] },
    { id: 'h2', name: 'صلاة في وقتها', icon: '🕌', category: 'spiritual', frequency: 'daily', streak: 0, completedDates: [] },
    { id: 'h3', name: 'مشي 20 دقيقة', icon: '🚶', category: 'health', frequency: 'daily', streak: 0, completedDates: [] },
  ],
  lifestyleLogs: [],
  focusSessions: [],
};

// ===== FATHY's data (projects, work, freelance, courses) - NO finance =====
export const FATHY_PRESET: Partial<AppState> = {
  context: {
    focusAreas: ['AI', '.NET'],
    companyProject: 'FlightAssist',
    freelanceTypes: ['website development', 'design work for Kuwait client'],
  },
  subjects: [
    { id: 's1', name: 'SET321 Software Formal Specifications', examDate: '2026-03-28', examTime: { start: '14:15', end: '15:15' }, totalLectures: 14, completedLectures: 5, difficulty: 'hard', color: '#ef4444' },
    { id: 's2', name: 'SET323 Real-Time and Embedded Systems Design', examDate: '2026-03-30', examTime: { start: '14:15', end: '15:15' }, totalLectures: 14, completedLectures: 4, difficulty: 'hard', color: '#3b82f6' },
    { id: 's3', name: 'HUM112 Health and Wellness', examDate: '2026-03-31', examTime: { start: '14:15', end: '15:15' }, totalLectures: 10, completedLectures: 5, difficulty: 'easy', color: '#10b981' },
    { id: 's4', name: 'SET372 Internet Programming', examDate: '2026-04-01', examTime: { start: '14:15', end: '15:15' }, totalLectures: 14, completedLectures: 5, difficulty: 'medium', color: '#f59e0b' },
    { id: 's5', name: 'SET322 Distributed Computing', examDate: '2026-04-02', examTime: { start: '14:15', end: '15:15' }, totalLectures: 14, completedLectures: 5, difficulty: 'hard', color: '#8b5cf6' },
    { id: 's6', name: 'SET311 Microcontrollers and Interfacing', examDate: '2026-05-01', totalLectures: 14, completedLectures: 5, difficulty: 'hard', color: '#ec4899', carryover: true, isPending: true },
  ],
  tasks: [
    { id: 't1', title: 'FlightAssist - API integration follow-up', type: 'work', priority: 'high', status: 'todo', deadline: '2026-03-23', estimatedMinutes: 120, focusType: 'deep' },
    { id: 't2', title: 'FlightAssist - review open subtasks and blockers', type: 'work', priority: 'medium', status: 'todo', deadline: '2026-03-24', estimatedMinutes: 60, focusType: 'medium' },
    { id: 't3', title: 'Kuwait client landing page', type: 'freelance', priority: 'high', status: 'todo', deadline: '2026-03-25', estimatedMinutes: 180, focusType: 'deep' },
    { id: 't4', title: 'Kuwait client design revisions', type: 'freelance', priority: 'medium', status: 'todo', deadline: '2026-03-26', estimatedMinutes: 120, focusType: 'medium' },
    { id: 't5', title: 'Study .NET course session', type: 'study', priority: 'medium', status: 'todo', deadline: '2026-03-19', estimatedMinutes: 90, focusType: 'deep' },
    { id: 't6', title: 'Study AI course session', type: 'study', priority: 'medium', status: 'todo', deadline: '2026-03-19', estimatedMinutes: 90, focusType: 'deep' },
  ],
  projects: [
    { id: 'p1', name: 'FlightAssist', type: 'work', priority: 'high', status: 'ongoing', color: '#0ea5e9' },
    { id: 'p2', name: 'Freelance Websites', type: 'freelance', priority: 'medium', status: 'ongoing', color: '#10b981' },
    { id: 'p3', name: 'Kuwait Design Client', type: 'freelance', priority: 'medium', status: 'ongoing', color: '#f59e0b' },
  ],
  courses: [
    { id: 'c1', name: '.NET Backend Development', platform: 'Self-study', totalHours: 36, completedHours: 8, weeklyGoalHours: 6, color: '#8b5cf6' },
    { id: 'c2', name: 'AI Fundamentals', platform: 'Self-study', totalHours: 40, completedHours: 7, weeklyGoalHours: 6, color: '#06b6d4' },
  ],
  habits: [
    { id: 'h1', name: 'ورد يومي', icon: '📖', category: 'spiritual', frequency: 'daily', streak: 5, completedDates: [] },
    { id: 'h2', name: 'صلاة في وقتها', icon: '🕌', category: 'spiritual', frequency: 'daily', streak: 7, completedDates: [] },
    { id: 'h3', name: 'قيام', icon: '🌙', category: 'spiritual', frequency: 'daily', streak: 3, completedDates: [] },
    { id: 'h4', name: 'مشي 20 دقيقة', icon: '🚶', category: 'health', frequency: 'daily', streak: 2, completedDates: [] },
    { id: 'h5', name: 'مراجعة سريعة قبل النوم', icon: '📚', category: 'study', frequency: 'daily', streak: 4, completedDates: [] },
  ],
};

// Keep INITIAL_DATA as alias for backward compat
export const INITIAL_DATA = EMPTY_STATE;
