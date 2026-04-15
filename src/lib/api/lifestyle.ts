// ═══════════════════════════════════════════════════════════════
//  src/lib/api/lifestyle.ts
//  Lifestyle API — aligned with new LifestyleLog interface
// ═══════════════════════════════════════════════════════════════

import { createCrudApiNew } from './crud';
import type { LifestyleLog } from '../../types/new';

export const lifestyleApiNew = createCrudApiNew<LifestyleLog>('/api/v1/lifestyle');
