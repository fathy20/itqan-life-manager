// ═══════════════════════════════════════════════════════════════
//  src/lib/api/ai.ts
//  AI coach, plan-day, weekly-review API module
// ═══════════════════════════════════════════════════════════════

import { apiNew } from './core';

export interface ChatMessage { role: 'user' | 'coach'; text: string }

export interface DayPlanBlock { time: string; task: string; type: 'study' | 'work' | 'health' | 'worship' }
export interface DayPlan {
  morning:          DayPlanBlock[];
  afternoon:        DayPlanBlock[];
  evening:          DayPlanBlock[];
  studyPriority:    string;
  focusTip:         string;
  motivationalNote: string;
}

export interface WeeklyReview {
  weeklyScore:              number;
  topAchievement:           string;
  biggestChallenge:         string;
  nextWeekRecommendations:  string[];
  encouragement:            string;
}

export const aiApiNew = {
  chat: (message: string, history: ChatMessage[]) =>
    apiNew.post<{ reply: string }>('/api/v1/ai/coach', { message, history }),

  planDay: () =>
    apiNew.post<DayPlan>('/api/v1/ai/plan-day'),

  weeklyReview: () =>
    apiNew.post<WeeklyReview>('/api/v1/ai/weekly-review'),
};
