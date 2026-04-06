import { apiNew } from './core';
import type {
  PrayerTimes,
  DayPrayerLog,
  PrayerName,
  PrayerStatus,
  PrayerStats,
} from '../../types/new';

export const salahApiNew = {
  getTimes: (lat: number, lng: number, method = 5) =>
    apiNew.get<PrayerTimes>(`/api/v1/salah/times?lat=${lat}&lng=${lng}&method=${method}`),

  getLog: (date: string) =>
    apiNew.get<DayPrayerLog>(`/api/v1/salah/log/${date}`),

  logPrayer: (data: {
    date: string;
    prayer: PrayerName;
    status: PrayerStatus;
    jamaah?: boolean;
    sunnahBefore?: boolean;
    sunnahAfter?: boolean;
  }) => apiNew.post('/api/v1/salah/log', data),

  logExtra: (data: { date: string; type: 'witr' | 'qiyam' | 'duha'; done: boolean }) =>
    apiNew.post('/api/v1/salah/log/extra', data),

  getStats: (period: 'week' | 'month') =>
    apiNew.get<PrayerStats>(`/api/v1/salah/stats?period=${period}`),

  getQada: () =>
    apiNew.get<{ total: number; completed: number; remaining: number }>('/api/v1/salah/qada'),

  updateQada: (delta: number) =>
    apiNew.put('/api/v1/salah/qada', { delta }),
};
