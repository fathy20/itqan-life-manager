import { describe, expect, it } from "vitest";
import { calculateFinanceSummary, normalizeSavingsAmount, safeAmount, wishlistProgress } from "../finance";

describe("finance module", () => {
  it("calculates balance from salary, transactions, sadaqah, and commitments", () => {
    const summary = calculateFinanceSummary({
      monthlySalary: 5000,
      transactions: [
        { id: "t1", title: "Client", amount: 1200, type: "income", category: "work", date: "2026-05-22" },
        { id: "t2", title: "Food", amount: 350, type: "expense", category: "daily", date: "2026-05-22" },
        { id: "t3", title: "Sadaqah", amount: 100, type: "sadaqah", category: "charity", date: "2026-05-22" },
      ],
      commitments: [
        { id: "c1", name: "Installment", amount: 700, dueDate: "2026-06-01", type: "installment" },
      ],
    });

    expect(summary).toEqual({
      income: 6200,
      expenses: 350,
      sadaqah: 100,
      commitments: 700,
      balance: 5050,
    });
  });

  it("ignores invalid negative or non-number amounts", () => {
    expect(safeAmount(-10)).toBe(0);
    expect(safeAmount("bad")).toBe(0);
    expect(safeAmount("150")).toBe(150);
  });

  it("keeps wishlist progress between 0 and 100", () => {
    expect(wishlistProgress({ price: 1000, savedAmount: 250 })).toBe(25);
    expect(wishlistProgress({ price: 1000, savedAmount: 5000 })).toBe(100);
    expect(wishlistProgress({ price: 0, savedAmount: 500 })).toBe(0);
  });

  it("clamps savings updates to the item price", () => {
    expect(normalizeSavingsAmount({ price: 1000, savedAmount: 950 }, 100)).toBe(1000);
    expect(normalizeSavingsAmount({ price: 1000, savedAmount: 50 }, -100)).toBe(0);
  });
});
