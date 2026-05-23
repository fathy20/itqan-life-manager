import type { LegacyCommitment, LegacyTransaction, LegacyWishlistItem } from "../../types";

export interface FinanceSummary {
  income: number;
  expenses: number;
  sadaqah: number;
  commitments: number;
  balance: number;
}

export function safeAmount(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function calculateFinanceSummary({
  monthlySalary,
  transactions,
  commitments,
}: {
  monthlySalary: number;
  transactions: LegacyTransaction[];
  commitments: LegacyCommitment[];
}): FinanceSummary {
  const salary = safeAmount(monthlySalary);
  const incomeTransactions = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + safeAmount(transaction.amount), 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + safeAmount(transaction.amount), 0);
  const sadaqah = transactions
    .filter((transaction) => transaction.type === "sadaqah")
    .reduce((sum, transaction) => sum + safeAmount(transaction.amount), 0);
  const commitmentTotal = commitments.reduce((sum, commitment) => sum + safeAmount(commitment.amount), 0);
  const income = salary + incomeTransactions;

  return {
    income,
    expenses,
    sadaqah,
    commitments: commitmentTotal,
    balance: income - expenses - sadaqah - commitmentTotal,
  };
}

export function wishlistProgress(item: Pick<LegacyWishlistItem, "price" | "savedAmount">) {
  const price = safeAmount(item.price);
  if (price === 0) return 0;
  return Math.min(100, Math.round((safeAmount(item.savedAmount) / price) * 100));
}

export function normalizeSavingsAmount(item: Pick<LegacyWishlistItem, "price" | "savedAmount">, delta: number) {
  const price = safeAmount(item.price);
  const nextAmount = safeAmount(item.savedAmount) + delta;
  return Math.min(price, Math.max(0, nextAmount));
}
