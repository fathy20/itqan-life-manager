// ═══════════════════════════════════════════════════════════════
//  src/lib/api/tasks.ts
//  Tasks API — aligned with new Task interface
// ═══════════════════════════════════════════════════════════════

import { createCrudApiNew } from './crud';
import type { Task } from '../../types/new';

export const tasksApiNew = createCrudApiNew<Task>('/api/v1/tasks');
