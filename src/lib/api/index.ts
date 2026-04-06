// ═══════════════════════════════════════════════════════════════
//  src/lib/api/index.ts
//  Re-exports all API modules
//  Import from here in hooks: import { salahApiNew } from '../lib/api'
// ═══════════════════════════════════════════════════════════════

export { apiNew, request } from './core';
export { profileApiNew } from './profile';
export { salahApiNew } from './salah';
export { scoreApiNew } from './score';
