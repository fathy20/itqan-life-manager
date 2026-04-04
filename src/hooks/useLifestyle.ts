import { useApp } from '../context/AppContext';

export function useLifestyle() {
  const { state, addHabit, updateHabit, deleteHabit, addLifestyleLog } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const habits = state.habits || [];
  const logs = state.lifestyleLogs || [];
  const todayLog = logs[0] || null;

  const toggleHabit = (id: string) => updateHabit(id, today);

  const sleepData = logs.slice(0, 7).reverse().map(log => ({
    date: log.date,
    sleepHours: log.sleepHours,
  }));

  return { habits, logs, todayLog, sleepData, toggleHabit, addHabit, deleteHabit, addLifestyleLog };
}
