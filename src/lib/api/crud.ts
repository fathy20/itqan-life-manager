// ═══════════════════════════════════════════════════════════════
//  src/lib/api/crud.ts
//  Generic CRUD API factory for new interface modules
//  Used by: subjects, tasks, projects, courses, habits, lifestyle, focus
// ═══════════════════════════════════════════════════════════════

import { apiNew } from './core';
import type { ApiResponse } from '../../types/new';

export function createCrudApiNew<T>(basePath: string) {
  return {
    list: () =>
      apiNew.get<T[]>(basePath),

    get: (id: string) =>
      apiNew.get<T>(`${basePath}/${id}`),

    create: (data: Partial<T>) =>
      apiNew.post<T>(basePath, data),

    update: (id: string, data: Partial<T>) =>
      apiNew.put<T>(`${basePath}/${id}`, data),

    delete: (id: string) =>
      apiNew.delete<void>(`${basePath}/${id}`),
  };
}
