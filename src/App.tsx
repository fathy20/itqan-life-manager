import React, { useState } from 'react';
import { CommandPalette } from './shared/components/CommandPalette';
import { GlobalNotifications } from './shared/components/GlobalNotifications';
import { AppProvider, useApp } from './context/AppContext';
import Onboarding from './pages/Onboarding';
import AuthScreen from './pages/AuthScreen';
import HomeScreen from './pages/HomeScreen';
import SalahSystem from './pages/SalahSystem';
import QuranScreen from './pages/QuranScreen';
import AdhkarSystem from './pages/AdhkarSystem';
import SibaqSystem from './pages/SibaqSystem';
import FastingSystem from './pages/FastingSystem';
import CoachScreen from './pages/CoachScreen';
import IntelligenceScreen from './pages/IntelligenceScreen';
import WorkScreen from './pages/WorkScreen';
import FinanceScreen from './pages/FinanceScreen';
import HealthScreen from './pages/HealthScreen';
import FocusScreen from './pages/FocusScreen';
import StudyScreen from './pages/StudyScreen';
import CalendarScreen from './pages/CalendarScreen';
import { signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { ArrowLeft, Clock } from 'lucide-react';

const BG = '#000E30';

// ── Back-button wrapper used by full-screen pages that don't supply their own ──
function PageWrapper({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background text-slate-200">
      <div className="sticky top-0 z-50 flex items-center gap-3 px-6 py-4 glass-panel border-b border-white/5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium"
        >
          <ArrowLeft size={16} /> الرئيسية
        </button>
      </div>
      <div className="animate-slide-up relative z-10">{children}</div>
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-500/5 blur-[120px] mix-blend-screen" />
      </div>
    </div>
  );
}

// ── Placeholder for modules not yet built ────────────────────
function ComingSoon({ nameAr, nameEn, onBack }: { nameAr: string; nameEn: string; onBack: () => void }) {
  return (
    <PageWrapper onBack={onBack}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] gap-4 text-center p-10">
        <div className="w-24 h-24 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
          <Clock size={40} className="text-sky-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">{nameAr}</h2>
        <div className="text-sm text-sky-500/70 font-mono tracking-[0.2em] uppercase">{nameEn}</div>
        <p className="text-lg text-slate-400 mt-2 font-medium">هذا القسم قيد التطوير — قريباً</p>
        <div className="text-xs text-slate-500 font-mono bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50 mt-4">
          Module in Development
        </div>
      </div>
    </PageWrapper>
  );
}


function AppInner() {
  const { currentUser, state } = useApp();
  const [activePage, setActivePage] = useState('dashboard');
  const isOnboarded = state.profile?.onboardingCompleted === true;

  if (!currentUser) return <AuthScreen />;
  if (!isOnboarded) return <Onboarding onComplete={() => {}} />;

  const navigate = (id: string) => setActivePage(id);
  const logout   = () => signOut(auth);
  const goHome   = () => navigate('dashboard');

  const getPage = () => {
    if (activePage === 'dashboard') return <HomeScreen onNavigate={navigate} onLogout={logout} />;
    if (activePage === 'salah')     return <SalahSystem onBack={goHome} />;
    if (activePage === 'quran')     return <QuranScreen onBack={goHome} />;
    if (activePage === 'adhkar')    return <AdhkarSystem onBack={goHome} />;
    if (activePage === 'fasting')   return <FastingSystem onBack={goHome} />;
    if (activePage === 'sibaq')     return <SibaqSystem onBack={goHome} />;
    if (activePage === 'coach')     return <CoachScreen onBack={goHome} />;
    if (activePage === 'intelligence') return <IntelligenceScreen onBack={goHome} onNavigate={navigate} />;
    if (activePage === 'work')      return <WorkScreen onBack={goHome} />;
    if (activePage === 'finance')   return <FinanceScreen onBack={goHome} />;
    if (activePage === 'health' || activePage === 'lifestyle') return <HealthScreen onBack={goHome} />;
    if (activePage === 'focus')     return <FocusScreen onBack={goHome} />;
    if (activePage === 'study')     return <StudyScreen onBack={goHome} />;
    if (activePage === 'calendar')  return <CalendarScreen onBack={goHome} />;
    return <HomeScreen onNavigate={navigate} onLogout={logout} />;
  };

  return (
    <>
      <CommandPalette onNavigate={navigate} />
      <GlobalNotifications />
      {getPage()}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
