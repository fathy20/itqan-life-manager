// ═══════════════════════════════════════════════════════════════
//  src/lib/api/focus.ts
//  Focus Sessions API — aligned with new FocusSession interface
// ═══════════════════════════════════════════════════════════════

import { apiNew } from './core';
import type { FocusSession } from '../../types/new';

export const focusApiNew = {
  list: () =>
    apiNew.get<FocusSession[]>('/api/v1/focus'),

  create: (data: {
    duration: number;
    type: 'study' | 'work' | 'quran' | 'other';
    label?: string;
    linkedTaskId?: string;
  }) => apiNew.post<FocusSession>('/api/v1/focus', data),

  delete: (id: string) =>
    apiNew.delete<void>(`/api/v1/focus/${id}`),
};
