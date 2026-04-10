import { apiNew } from './core';
import type { FastingDay, FastingQada } from '../../types/new';

export const fastingApiNew = {
  // GET /api/v1/fasting/month/:year/:month
  getMonth: (year: number, month: number) =>
    apiNew.get<FastingDay[]>(`/api/v1/fasting/month/${year}/${month}`),

  // POST /api/v1/fasting/log  (upsert — used for both create and update)
  logDay: (date: string, type: string, completed: boolean, notes?: string) =>
    apiNew.post<FastingDay>('/api/v1/fasting/log', { date, type, completed, notes }),

  // GET /api/v1/fasting/qada
  getQada: () =>
    apiNew.get<FastingQada>('/api/v1/fasting/qada'),

  // PUT /api/v1/fasting/qada  — backend expects { delta: number }
  updateQada: (delta: number) =>
    apiNew.put<FastingQada>('/api/v1/fasting/qada', { delta }),

  // GET /api/v1/fasting/suggestions
  getSuggestions: () =>
    apiNew.get<string[]>('/api/v1/fasting/suggestions'),
};
