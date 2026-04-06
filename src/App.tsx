import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import CommandBar from './components/layout/CommandBar';
import StudySystem from './pages/StudySystem';
import WorkSystem from './pages/WorkSystem';
import FinanceSystem from './pages/FinanceSystem';
import FinanceLock from './components/FinanceLock';
import LifestyleSystem from './pages/LifestyleSystem';
import CalendarView from './pages/CalendarView';
import FocusTimer from './pages/FocusTimer';
import PlanBuilder from './pages/PlanBuilder';
import TelegramCoach from './pages/TelegramCoach';
import Onboarding from './pages/Onboarding';
import AuthScreen from './pages/AuthScreen';
import HomeScreen from './pages/HomeScreen';
import SalahSystem from './pages/SalahSystem';
import QuranSystem from './pages/QuranSystem';
import AdhkarSystem from './pages/AdhkarSystem';
import SibaqSystem from './pages/SibaqSystem';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { LogOut } from 'lucide-react';

// Pages that use their own full-screen layout (no sidebar/wrapper)
const FULLSCREEN_PAGES = ['dashboard', 'salah'];

function AppInner() {
  const { currentUser, state } = useApp();
  const [activePage, setActivePage] = useState('dashboard');
  const isOnboarded = !!state.profile?.name;

  // Not logged in → Auth screen
  if (!currentUser) return <AuthScreen />;

  // Logged in but no profile → Onboarding
  if (!isOnboarded) return <Onboarding onComplete={() => {}} />;

  const navigate = (id: string) => setActivePage(id);

  // Full-screen new pages — rendered without sidebar/wrapper
  if (activePage === 'dashboard') {
    return <HomeScreen onNavigate={navigate} />;
  }
  if (activePage === 'salah') {
    return <SalahSystem onBack={() => navigate('dashboard')} />;
  }
  if (activePage === 'quran') {
    return <QuranSystem />;
  }
  if (activePage === 'adhkar') {
    return <AdhkarSystem />;
  }
  if (activePage === 'sibaq') {
    return <SibaqSystem />;
  }

  // Legacy pages — wrapped in old sidebar layout
  const renderPage = () => {
    switch (activePage) {
      case 'study':    return <StudySystem />;
      case 'work':     return <WorkSystem />;
      case 'finance':  return <FinanceLock><FinanceSystem /></FinanceLock>;
      case 'lifestyle':return <LifestyleSystem />;
      case 'calendar': return <CalendarView />;
      case 'focus':    return <FocusTimer />;
      case 'plan-builder': return <PlanBuilder />;
      case 'telegram': return <TelegramCoach />;
      default:         return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row" dir="rtl">
      <Sidebar activePage={activePage} setActivePage={navigate} />
      <main className="flex-1 pb-24 md:pb-0 md:pr-64 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* User bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
                {state.profile.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="text-sm text-white/40 font-bold">{state.profile.name}</span>
            </div>
            <button onClick={() => signOut(auth)}
              className="flex items-center gap-1.5 text-xs text-white/20 hover:text-red-400 transition-colors">
              <LogOut size={14} /> خروج
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activePage}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomNav activePage={activePage} setActivePage={navigate} />
      <CommandBar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
