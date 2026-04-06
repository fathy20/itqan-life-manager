import { apiNew } from './core';
import type { DailyScore, SharedScore } from '../../types/new';

export const scoreApiNew = {
  getToday:  () => apiNew.get<DailyScore>('/api/v1/score/today'),
  getShared: () => apiNew.get<SharedScore>('/api/v1/score/shared'),
};
