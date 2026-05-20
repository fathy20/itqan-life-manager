import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { EMPTY_STATE } from '../constants';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  currentUser: User | null;
  // Subjects
  addSubject: (s: Omit<AppState['subjects'][0], 'id'>) => void;
  updateSubject: (id: string, s: Partial<AppState['subjects'][0]>) => void;
  deleteSubject: (id: string) => void;
  // Tasks
  addTask: (t: Omit<AppState['tasks'][0], 'id'>) => void;
  updateTask: (id: string, t: Partial<AppState['tasks'][0]>) => void;
  deleteTask: (id: string) => void;
  // Projects
  addProject: (p: Omit<AppState['projects'][0], 'id'>) => void;
  updateProject: (id: string, p: Partial<AppState['projects'][0]>) => void;
  deleteProject: (id: string) => void;
  // Courses
  addCourse: (c: Omit<AppState['courses'][0], 'id'>) => void;
  updateCourse: (id: string, c: Partial<AppState['courses'][0]>) => void;
  deleteCourse: (id: string) => void;
  // Finance
  addTransaction: (t: Omit<AppState['transactions'][0], 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addWishlistItem: (i: Omit<AppState['wishlist'][0], 'id'>) => void;
  updateWishlistItem: (id: string, i: Partial<AppState['wishlist'][0]>) => void;
  deleteWishlistItem: (id: string) => void;
  addCommitment: (c: Omit<AppState['commitments'][0], 'id'>) => void;
  updateCommitment: (id: string, c: Partial<AppState['commitments'][0]>) => void;
  deleteCommitment: (id: string) => void;
  setMonthlySalary: (salary: number) => void;
  // Habits
  addHabit: (h: Omit<AppState['habits'][0], 'id' | 'streak' | 'completedDates'>) => void;
  updateHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  // Lifestyle
  addLifestyleLog: (log: AppState['lifestyleLogs'][0]) => void;
  // Focus
  addFocusSession: (s: Omit<AppState['focusSessions'][0], 'id'>) => void;
  // Reset
  resetState: (newState: AppState) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const uid = () => Math.random().toString(36).substr(2, 9);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const initialized = useRef(false);
  const skipSave = useRef(false);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (!user) {
        setState(EMPTY_STATE);
        initialized.current = false;
      }
    });
    return () => unsub();
  }, []);

  // Load from Firestore when user logs in
  useEffect(() => {
    if (!currentUser) return;
    initialized.current = false;
    getDoc(doc(db, 'users', currentUser.uid)).then((snap) => {
      if (snap.exists()) {
        skipSave.current = true;
        const savedState = snap.data() as AppState;
        const onboardingCompleted =
          savedState.profile?.onboardingCompleted ?? Boolean(savedState.profile?.name);

        setState(() => ({
          ...EMPTY_STATE,
          ...savedState,
          profile: {
            ...EMPTY_STATE.profile,
            ...savedState.profile,
            onboardingCompleted,
          },
        }));
      } else if (currentUser.displayName) {
        skipSave.current = true;
        setState(() => ({
          ...EMPTY_STATE,
          profile: {
            ...EMPTY_STATE.profile,
            name: currentUser.displayName || '',
            onboardingCompleted: false,
          },
        }));
      }
      initialized.current = true;
    }).catch(() => { initialized.current = true; });
  }, [currentUser]);

  // Save to Firestore + localStorage on state change
  useEffect(() => {
    localStorage.setItem('itqan_state', JSON.stringify(state));
    if (!initialized.current || !currentUser) return;
    if (skipSave.current) { skipSave.current = false; return; }
    setDoc(doc(db, 'users', currentUser.uid), state, { merge: true }).catch(console.error);
  }, [state, currentUser]);

  // ===== SUBJECTS =====
  const addSubject = (s: Omit<AppState['subjects'][0], 'id'>) =>
    setState(p => ({ ...p, subjects: [...p.subjects, { ...s, id: uid() }] }));
  const updateSubject = (id: string, s: Partial<AppState['subjects'][0]>) =>
    setState(p => ({ ...p, subjects: p.subjects.map(x => x.id === id ? { ...x, ...s } : x) }));
  const deleteSubject = (id: string) =>
    setState(p => ({ ...p, subjects: p.subjects.filter(x => x.id !== id) }));

  // ===== TASKS =====
  const addTask = (t: Omit<AppState['tasks'][0], 'id'>) =>
    setState(p => ({ ...p, tasks: [...p.tasks, { ...t, id: uid() }] }));
  const updateTask = (id: string, t: Partial<AppState['tasks'][0]>) =>
    setState(p => ({ ...p, tasks: p.tasks.map(x => x.id === id ? { ...x, ...t } : x) }));
  const deleteTask = (id: string) =>
    setState(p => ({ ...p, tasks: p.tasks.filter(x => x.id !== id) }));

  // ===== PROJECTS =====
  const addProject = (p2: Omit<AppState['projects'][0], 'id'>) =>
    setState(p => ({ ...p, projects: [...p.projects, { ...p2, id: uid() }] }));
  const updateProject = (id: string, p2: Partial<AppState['projects'][0]>) =>
    setState(p => ({ ...p, projects: p.projects.map(x => x.id === id ? { ...x, ...p2 } : x) }));
  const deleteProject = (id: string) =>
    setState(p => ({ ...p, projects: p.projects.filter(x => x.id !== id) }));

  // ===== COURSES =====
  const addCourse = (c: Omit<AppState['courses'][0], 'id'>) =>
    setState(p => ({ ...p, courses: [...p.courses, { ...c, id: uid() }] }));
  const updateCourse = (id: string, c: Partial<AppState['courses'][0]>) =>
    setState(p => ({ ...p, courses: p.courses.map(x => x.id === id ? { ...x, ...c } : x) }));
  const deleteCourse = (id: string) =>
    setState(p => ({ ...p, courses: p.courses.filter(x => x.id !== id) }));

  // ===== FINANCE =====
  const addTransaction = (t: Omit<AppState['transactions'][0], 'id'>) =>
    setState(p => ({ ...p, transactions: [{ ...t, id: uid() }, ...p.transactions] }));
  const deleteTransaction = (id: string) =>
    setState(p => ({ ...p, transactions: p.transactions.filter(x => x.id !== id) }));
  const addWishlistItem = (i: Omit<AppState['wishlist'][0], 'id'>) =>
    setState(p => ({ ...p, wishlist: [...p.wishlist, { ...i, id: uid() }] }));
  const updateWishlistItem = (id: string, i: Partial<AppState['wishlist'][0]>) =>
    setState(p => ({ ...p, wishlist: p.wishlist.map(x => x.id === id ? { ...x, ...i } : x) }));
  const deleteWishlistItem = (id: string) =>
    setState(p => ({ ...p, wishlist: p.wishlist.filter(x => x.id !== id) }));
  const addCommitment = (c: Omit<AppState['commitments'][0], 'id'>) =>
    setState(p => ({ ...p, commitments: [...p.commitments, { ...c, id: uid() }] }));
  const updateCommitment = (id: string, c: Partial<AppState['commitments'][0]>) =>
    setState(p => ({ ...p, commitments: p.commitments.map(x => x.id === id ? { ...x, ...c } : x) }));
  const deleteCommitment = (id: string) =>
    setState(p => ({ ...p, commitments: p.commitments.filter(x => x.id !== id) }));
  const setMonthlySalary = (salary: number) =>
    setState(p => ({ ...p, monthlySalary: salary }));

  // ===== HABITS =====
  const addHabit = (h: Omit<AppState['habits'][0], 'id' | 'streak' | 'completedDates'>) =>
    setState(p => ({ ...p, habits: [...p.habits, { ...h, id: uid(), streak: 0, completedDates: [] }] }));
  const updateHabit = (habitId: string, date: string) =>
    setState(p => ({
      ...p,
      habits: p.habits.map(h => {
        if (h.id !== habitId) return h;
        const done = h.completedDates.includes(date);
        return { ...h, completedDates: done ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date] };
      })
    }));
  const deleteHabit = (id: string) =>
    setState(p => ({ ...p, habits: p.habits.filter(x => x.id !== id) }));

  // ===== LIFESTYLE =====
  const addLifestyleLog = (log: AppState['lifestyleLogs'][0]) =>
    setState(p => ({ ...p, lifestyleLogs: [log, ...p.lifestyleLogs.filter(l => l.date !== log.date)] }));

  // ===== FOCUS =====
  const addFocusSession = (s: Omit<AppState['focusSessions'][0], 'id'>) =>
    setState(p => ({ ...p, focusSessions: [...p.focusSessions, { ...s, id: uid() }] }));

  const resetState = (newState: AppState) => setState(newState);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      state, setState, currentUser,
      addSubject, updateSubject, deleteSubject,
      addTask, updateTask, deleteTask,
      addProject, updateProject, deleteProject,
      addCourse, updateCourse, deleteCourse,
      addTransaction, deleteTransaction,
      addWishlistItem, updateWishlistItem, deleteWishlistItem,
      addCommitment, updateCommitment, deleteCommitment,
      setMonthlySalary,
      addHabit, updateHabit, deleteHabit,
      addLifestyleLog, addFocusSession,
      resetState,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
