import { apiNew } from './core';
import type {
  KhatmaPlan,
  QuranSession,
  SurahHifz,
} from '../../types/new';

export const quranApiNew = {
  getPlans: () =>
    apiNew.get<KhatmaPlan[]>('/api/v1/quran/plans'),

  createPlan: (data: { targetDays: number; dailyPages: number; startPage?: number }) =>
    apiNew.post<KhatmaPlan>('/api/v1/quran/plans', data),

  updatePlan: (id: string, data: { currentPage?: number; status?: 'active' | 'completed' | 'paused' }) =>
    apiNew.put<KhatmaPlan>(`/api/v1/quran/plans/${id}`, data),

  logSession: (data: {
    type: 'reading' | 'hifz' | 'review';
    fromPage?: number;
    toPage?: number;
    surah?: number;
    durationMinutes?: number;
    date: string;
  }) => apiNew.post<QuranSession>('/api/v1/quran/log', data),

  getHifz: () =>
    apiNew.get<SurahHifz[]>('/api/v1/quran/hifz'),

  updateHifz: (surahNum: number, data: {
    memorizedAyahs?: number;
    status?: SurahHifz['status'];
    nextReviewDate?: string;
  }) => apiNew.put<SurahHifz>(`/api/v1/quran/hifz/${surahNum}`, data),

  getReviewsDue: () =>
    apiNew.get<SurahHifz[]>('/api/v1/quran/reviews/due'),

  getStats: () =>
    apiNew.get<{ weeklyPages: number; totalMemorized: number; reviewsDue: number }>('/api/v1/quran/stats'),
};
