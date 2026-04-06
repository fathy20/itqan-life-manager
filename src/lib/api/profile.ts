import { apiNew } from './core';
import type { UserProfile } from '../../types/new';

export const profileApiNew = {
  get:    () => apiNew.get<UserProfile>('/api/v1/profile'),
  update: (data: Partial<UserProfile>) => apiNew.put('/api/v1/profile', data),
};
