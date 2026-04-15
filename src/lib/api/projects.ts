// ═══════════════════════════════════════════════════════════════
//  src/lib/api/projects.ts
//  Projects API — aligned with new Project interface
// ═══════════════════════════════════════════════════════════════

import { createCrudApiNew } from './crud';
import type { Project } from '../../types/new';

export const projectsApiNew = createCrudApiNew<Project>('/api/v1/projects');
