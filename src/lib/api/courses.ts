// ═══════════════════════════════════════════════════════════════
//  src/lib/api/courses.ts
//  Courses API — aligned with new Course interface
// ═══════════════════════════════════════════════════════════════

import { createCrudApiNew } from './crud';
import type { Course } from '../../types/new';

export const coursesApiNew = createCrudApiNew<Course>('/api/v1/courses');
