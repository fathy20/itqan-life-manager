import { apiNew } from './core';
import type { DayAdhkarLog, AdhkarStats } from '../../types/new';

export const adhkarApiNew = {
  getToday: () =>
    apiNew.get<DayAdhkarLog>('/api/v1/adhkar/today'),

  logBlock: (block: string) =>
    apiNew.post<DayAdhkarLog>('/api/v1/adhkar/log', { block }),

  updateCounter: (counter: string, value: number) =>
    apiNew.put<DayAdhkarLog>('/api/v1/adhkar/counter', { counter, value }),

  getStats: (period: 'week' | 'month') =>
    apiNew.get<AdhkarStats>(`/api/v1/adhkar/stats?period=${period}`),
};
