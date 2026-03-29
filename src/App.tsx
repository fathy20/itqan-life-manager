import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import CommandBar from './components/layout/CommandBar';
import Dashboard from './pages/Dashboard';
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
import { motion, AnimatePresence } from 'motion/react';

function AppInner() {
  const [activePage, setActivePage] = useState('dashboard');
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('itqan_onboarded'));

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'study': return <StudySystem />;
      case 'work': return <WorkSystem />;
      case 'finance': return <FinanceLock><FinanceSystem /></FinanceLock>;
      case 'lifestyle': return <LifestyleSystem />;
      case 'calendar': return <CalendarView />;
      case 'focus': return <FocusTimer />;
      case 'plan-builder': return <PlanBuilder />;
      case 'telegram': return <TelegramCoach />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row" dir="rtl">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 pb-24 md:pb-0 md:pr-64 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
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
