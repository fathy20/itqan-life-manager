import React, { useState } from 'react';
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
    <div style={{ minHeight: '100vh', background: BG, color: '#C0C8D8' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 24px', borderBottom: '1px solid #0F2847',
        position: 'sticky', top: 0, background: BG, zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
            background: 'transparent', border: '1px solid #0F2847', color: '#3D5A80',
            fontSize: 13, fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={16} /> الرئيسية
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ── Placeholder for modules not yet built ────────────────────
function ComingSoon({ nameAr, nameEn, onBack }: { nameAr: string; nameEn: string; onBack: () => void }) {
  return (
    <PageWrapper onBack={onBack}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 65px)', gap: 16, textAlign: 'center', padding: 40,
      }}>
        <Clock size={48} color='#08A7E7' strokeWidth={1.5} />
        <div style={{ fontSize: 28, fontWeight: 700, color: '#C0C8D8', fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{nameAr}</div>
        <div style={{ fontSize: 12, color: '#3D5A80', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '2px', textTransform: 'uppercase' }}>{nameEn}</div>
        <div style={{ fontSize: 15, color: '#4A6A8A', fontFamily: "'Noto Kufi Arabic', sans-serif", marginTop: 8 }}>هذا القسم قيد التطوير — قريباً</div>
        <div style={{ fontSize: 11, color: '#2A4A6A', fontFamily: "'JetBrains Mono', monospace" }}>Coming soon</div>
      </div>
    </PageWrapper>
  );
}

import { CommandPalette } from './shared/components/CommandPalette';
import { GlobalNotifications } from './shared/components/GlobalNotifications';

function AppInner() {
  const { currentUser, state } = useApp();
  const [activePage, setActivePage] = useState('dashboard');
  const isOnboarded = !!state.profile?.name;

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
    if (activePage === 'intelligence') return <IntelligenceScreen onBack={goHome} />;
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
