import { apiNew } from './core';
import type {
  Halaqah,
  HalaqahSummary,
  HalaqahLeaderboardEntry,
  HalaqahChallenge,
  DuaRequest,
} from '../../types/new';

export const halaqahApiNew = {
  getAll: () =>
    apiNew.get<HalaqahSummary[]>('/api/v1/halaqah'),

  create: (name: string) =>
    apiNew.post<Halaqah>('/api/v1/halaqah', { name }),

  join: (inviteCode: string) =>
    apiNew.post<{ id: string; name: string }>('/api/v1/halaqah/join', { inviteCode }),

  leave: (id: string) =>
    apiNew.delete<{ left: true }>(`/api/v1/halaqah/${id}/leave`),

  getLeaderboard: (id: string) =>
    apiNew.get<HalaqahLeaderboardEntry[]>(`/api/v1/halaqah/${id}/leaderboard`),

  getDuas: (id: string) =>
    apiNew.get<DuaRequest[]>(`/api/v1/halaqah/${id}/duas`),

  addDua: (id: string, text: string) =>
    apiNew.post<DuaRequest>(`/api/v1/halaqah/${id}/duas`, { text }),

  prayForDua: (id: string, duaId: string) =>
    apiNew.post<{ prayed: true }>(`/api/v1/halaqah/${id}/duas/${duaId}/pray`, {}),

  sendNaseeha: (id: string, text: string) =>
    apiNew.post<{ sent: true }>(`/api/v1/halaqah/${id}/naseeha`, { text }),

  getChallenge: (id: string) =>
    apiNew.get<HalaqahChallenge | null>(`/api/v1/halaqah/${id}/challenge`),

  completeChallenge: (id: string, challengeId: string) =>
    apiNew.post<{ completed: true }>(`/api/v1/halaqah/${id}/challenge/${challengeId}/complete`, {}),
};
