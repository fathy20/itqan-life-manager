import { apiNew } from './core';
import type { FastingDay, FastingQada } from '../../types/new';

export const fastingApiNew = {
  getMonth: (year: number, month: number) =>
    apiNew.get<FastingDay[]>(`/api/v1/fasting?year=${year}&month=${month}`),

  logDay: (date: string, type: string, completed: boolean, notes?: string) =>
    apiNew.post<FastingDay>('/api/v1/fasting', { date, type, completed, notes }),

  updateDay: (date: string, completed: boolean, notes?: string) =>
    apiNew.put<FastingDay>(`/api/v1/fasting/${date}`, { completed, notes }),

  getQada: () =>
    apiNew.get<FastingQada>('/api/v1/fasting/qada'),

  updateQada: (totalOwed: number, completed: number) =>
    apiNew.put<FastingQada>('/api/v1/fasting/qada', { totalOwed, completed }),

  getSuggestions: () =>
    apiNew.get<string[]>('/api/v1/fasting/suggestions'),
};
