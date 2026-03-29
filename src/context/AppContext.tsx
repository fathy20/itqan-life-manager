import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { INITIAL_DATA } from '../constants';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addSubject: (subject: Omit<AppState['subjects'][0], 'id'>) => void;
  updateSubject: (id: string, subject: Partial<AppState['subjects'][0]>) => void;
  deleteSubject: (id: string) => void;
  addTask: (task: Omit<AppState['tasks'][0], 'id'>) => void;
  addTransaction: (transaction: Omit<AppState['transactions'][0], 'id'>) => void;
  addWishlistItem: (item: Omit<AppState['wishlist'][0], 'id'>) => void;
  updateWishlistItem: (id: string, item: Partial<AppState['wishlist'][0]>) => void;
  deleteWishlistItem: (id: string) => void;
  addCommitment: (commitment: Omit<AppState['commitments'][0], 'id'>) => void;
  updateCommitment: (id: string, commitment: Partial<AppState['commitments'][0]>) => void;
  deleteCommitment: (id: string) => void;
  setMonthlySalary: (salary: number) => void;
  updateHabit: (habitId: string, date: string) => void;
  resetState: (newState: AppState) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('itqan_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.profile) return INITIAL_DATA;
        return {
          ...INITIAL_DATA,
          ...parsed,
          profile: { ...INITIAL_DATA.profile, ...parsed.profile },
          context: { ...INITIAL_DATA.context, ...parsed.context },
          telegram: { ...INITIAL_DATA.telegram, ...parsed.telegram },
          calendarContext: { ...INITIAL_DATA.calendarContext, ...parsed.calendarContext }
        };
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  const initialized = useRef(false);
  const skipFirebase = useRef(false);

  // Load from Firestore on mount (if user has a name)
  useEffect(() => {
    const userId = state.profile?.name?.trim().toLowerCase().replace(/\s/g, '_');
    if (!userId) { initialized.current = true; return; }

    getDoc(doc(db, 'users', userId)).then((snap) => {
      if (snap.exists()) {
        const remote = snap.data() as AppState;
        skipFirebase.current = true;
        setState(prev => ({ ...prev, ...remote, profile: { ...prev.profile, ...remote.profile } }));
      }
      initialized.current = true;
    }).catch(() => { initialized.current = true; });
  }, []);

  // Save to Firestore + localStorage on every state change
  useEffect(() => {
    localStorage.setItem('itqan_state', JSON.stringify(state));

    if (!initialized.current) return;
    if (skipFirebase.current) { skipFirebase.current = false; return; }

    const userId = state.profile?.name?.trim().toLowerCase().replace(/\s/g, '_');
    if (!userId) return;

    setDoc(doc(db, 'users', userId), state, { merge: true }).catch(console.error);
  }, [state]);

  const addSubject = (subject: Omit<AppState['subjects'][0], 'id'>) => {
    const newSubject = { ...subject, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
  };

  const updateSubject = (id: string, subject: Partial<AppState['subjects'][0]>) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, ...subject } : s)
    }));
  };

  const deleteSubject = (id: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id)
    }));
  };

  const addTask = (task: Omit<AppState['tasks'][0], 'id'>) => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const addTransaction = (transaction: Omit<AppState['transactions'][0], 'id'>) => {
    const newTransaction = { ...transaction, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, transactions: [...prev.transactions, newTransaction] }));
  };

  const addWishlistItem = (item: Omit<AppState['wishlist'][0], 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, wishlist: [...prev.wishlist, newItem] }));
  };

  const updateWishlistItem = (id: string, item: Partial<AppState['wishlist'][0]>) => {
    setState(prev => ({
      ...prev,
      wishlist: prev.wishlist.map(w => w.id === id ? { ...w, ...item } : w)
    }));
  };

  const deleteWishlistItem = (id: string) => {
    setState(prev => ({
      ...prev,
      wishlist: prev.wishlist.filter(w => w.id !== id)
    }));
  };

  const addCommitment = (commitment: Omit<AppState['commitments'][0], 'id'>) => {
    const newCommitment = { ...commitment, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, commitments: [...prev.commitments, newCommitment] }));
  };

  const updateCommitment = (id: string, commitment: Partial<AppState['commitments'][0]>) => {
    setState(prev => ({
      ...prev,
      commitments: prev.commitments.map(c => c.id === id ? { ...c, ...commitment } : c)
    }));
  };

  const deleteCommitment = (id: string) => {
    setState(prev => ({
      ...prev,
      commitments: prev.commitments.filter(c => c.id !== id)
    }));
  };

  const setMonthlySalary = (salary: number) => {
    setState(prev => ({ ...prev, monthlySalary: salary }));
  };

  const updateHabit = (habitId: string, date: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id === habitId) {
          const isCompleted = h.completedDates.includes(date);
          const newDates = isCompleted 
            ? h.completedDates.filter(d => d !== date)
            : [...h.completedDates, date];
          return { ...h, completedDates: newDates };
        }
        return h;
      })
    }));
  };

  const resetState = (newState: AppState) => {
    setState(newState);
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      setState, 
      addSubject, 
      updateSubject, 
      deleteSubject, 
      addTask, 
      addTransaction, 
      addWishlistItem,
      updateWishlistItem,
      deleteWishlistItem,
      addCommitment,
      updateCommitment,
      deleteCommitment,
      setMonthlySalary,
      updateHabit, 
      resetState 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
