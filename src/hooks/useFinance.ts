import { useApp } from '../context/AppContext';

export function useFinance() {
  const { state, addTransaction, deleteTransaction, addWishlistItem, updateWishlistItem, deleteWishlistItem, addCommitment, updateCommitment, deleteCommitment, setMonthlySalary } = useApp();

  const transactions = state.transactions || [];
  const wishlist = state.wishlist || [];
  const commitments = state.commitments || [];

  const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = income - expenses;

  return {
    transactions, wishlist, commitments,
    income, expenses, balance,
    monthlySalary: state.monthlySalary,
    addTransaction, deleteTransaction,
    addWishlistItem, updateWishlistItem, deleteWishlistItem,
    addCommitment, updateCommitment, deleteCommitment,
    setMonthlySalary,
  };
}
