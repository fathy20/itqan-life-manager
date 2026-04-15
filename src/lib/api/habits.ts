// ═══════════════════════════════════════════════════════════════
//  src/lib/api/habits.ts
//  Habits API — aligned with new Habit interface
// ═══════════════════════════════════════════════════════════════

import { createCrudApiNew } from './crud';
import type { Habit } from '../../types/new';

export const habitsApiNew = createCrudApiNew<Habit>('/api/v1/habits');
