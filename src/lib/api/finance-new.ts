// ═══════════════════════════════════════════════════════════════
//  src/lib/api/finance-new.ts
//  Finance API — aligned with new Transaction, WishlistItem, Commitment
// ═══════════════════════════════════════════════════════════════

import { apiNew } from './core';
import { createCrudApiNew } from './crud';
import type { Transaction, WishlistItem, Commitment } from '../../types/new';

export const financeApiNew = {
  transactions: createCrudApiNew<Transaction>('/api/v1/finance/transactions'),
  wishlist:     createCrudApiNew<WishlistItem>('/api/v1/finance/wishlist'),
  commitments:  createCrudApiNew<Commitment>('/api/v1/finance/commitments'),

  getSalary: () =>
    apiNew.get<{ monthlySalary: number }>('/api/v1/finance/salary'),

  setSalary: (amount: number) =>
    apiNew.put<{ monthlySalary: number }>('/api/v1/finance/salary', { monthlySalary: amount }),
};
