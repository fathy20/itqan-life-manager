// ═══════════════════════════════════════════════════════════════
//  src/lib/api/subjects.ts
//  Subjects API — aligned with new Subject interface
// ═══════════════════════════════════════════════════════════════

import { createCrudApiNew } from './crud';
import type { Subject } from '../../types/new';

export const subjectsApiNew = createCrudApiNew<Subject>('/api/v1/subjects');
