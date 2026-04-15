// ═══════════════════════════════════════════════════════════════
//  src/lib/api/index.ts
//  Re-exports all API modules (both Islamic + CRUD)
//  Import from here: import { salahApiNew, tasksApiNew } from '../lib/api'
// ═══════════════════════════════════════════════════════════════

// ── Core ─────────────────────────────────────────────────────
export { apiNew, request } from './core';
export { createCrudApiNew } from './crud';

// ── Profile ──────────────────────────────────────────────────
export { profileApiNew } from './profile';

// ── Islamic Modules ──────────────────────────────────────────
export { salahApiNew } from './salah';
export { scoreApiNew } from './score';
export { quranApiNew } from './quran';
export { adhkarApiNew } from './adhkar';
export { halaqahApiNew } from './halaqah';
export { fastingApiNew } from './fasting';
export { aiApiNew } from './ai';
export { intelligenceApiNew } from './intelligence';

// ── CRUD Modules (aligned with new interfaces) ──────────────
export { subjectsApiNew } from './subjects';
export { tasksApiNew } from './tasks';
export { projectsApiNew } from './projects';
export { coursesApiNew } from './courses';
export { financeApiNew } from './finance-new';
export { habitsApiNew } from './habits';
export { lifestyleApiNew } from './lifestyle';
export { focusApiNew } from './focus';
