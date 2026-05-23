import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { ArrowLeft, Clock } from "lucide-react";
import { CommandPalette } from "./shared/components/CommandPalette";
import { GlobalNotifications } from "./shared/components/GlobalNotifications";
import { AppProvider, useApp } from "./context/AppContext";
import Onboarding from "./pages/Onboarding";
import AuthScreen from "./pages/AuthScreen";
import HomeScreen from "./pages/HomeScreen";
import SalahSystem from "./pages/SalahSystem";
import QuranScreen from "./pages/QuranScreen";
import AdhkarSystem from "./pages/AdhkarSystem";
import SibaqSystem from "./pages/SibaqSystem";
import FastingSystem from "./pages/FastingSystem";
import CoachScreen from "./pages/CoachScreen";
import IntelligenceScreen from "./pages/IntelligenceScreen";
import WorkScreen from "./pages/WorkScreen";
import FinanceScreen from "./pages/FinanceScreen";
import HealthScreen from "./pages/HealthScreen";
import FocusScreen from "./pages/FocusScreen";
import StudyScreen from "./pages/StudyScreen";
import CalendarScreen from "./pages/CalendarScreen";
import { auth } from "./lib/firebase";

function PageWrapper({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-slate-200">
      <div className="glass-panel sticky top-0 z-50 flex items-center gap-3 border-b border-white/5 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft size={16} />
          الرئيسية
        </button>
      </div>
      <div className="animate-slide-up relative z-10">{children}</div>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[50vw] w-[50vw] rounded-full bg-sky-500/5 blur-[120px] mix-blend-screen" />
      </div>
    </div>
  );
}

function ComingSoon({ nameAr, nameEn, onBack }: { nameAr: string; nameEn: string; onBack: () => void }) {
  return (
    <PageWrapper onBack={onBack}>
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
          <Clock size={40} className="text-sky-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-black tracking-tight text-white">{nameAr}</h2>
        <div className="font-mono text-sm uppercase tracking-[0.2em] text-sky-500/70">{nameEn}</div>
        <p className="mt-2 text-lg font-medium text-slate-400">القسم ده تحت التطوير وقريبًا هيتفعل.</p>
        <div className="mt-4 rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1 font-mono text-xs text-slate-500">
          Module in Development
        </div>
      </div>
    </PageWrapper>
  );
}

function AppInner() {
  const { currentUser, state } = useApp();
  const [activePage, setActivePage] = useState("dashboard");
  const isOnboarded = state.profile?.onboardingCompleted === true;

  if (!currentUser) return <AuthScreen />;
  if (!isOnboarded) return <Onboarding onComplete={() => {}} />;

  const navigate = (id: string) => setActivePage(id);
  const logout = () => signOut(auth);
  const goHome = () => navigate("dashboard");

  const getPage = () => {
    if (activePage === "dashboard") return <HomeScreen onNavigate={navigate} onLogout={logout} />;
    if (activePage === "salah") return <SalahSystem onBack={goHome} />;
    if (activePage === "quran") return <QuranScreen onBack={goHome} />;
    if (activePage === "adhkar") return <AdhkarSystem onBack={goHome} />;
    if (activePage === "fasting") return <FastingSystem onBack={goHome} />;
    if (activePage === "sibaq") return <SibaqSystem onBack={goHome} />;
    if (activePage === "coach") return <CoachScreen onBack={goHome} />;
    if (activePage === "intelligence") return <IntelligenceScreen onBack={goHome} onNavigate={navigate} />;
    if (activePage === "work") return <WorkScreen onBack={goHome} />;
    if (activePage === "finance") return <FinanceScreen onBack={goHome} />;
    if (activePage === "health" || activePage === "lifestyle") return <HealthScreen onBack={goHome} />;
    if (activePage === "focus") return <FocusScreen onBack={goHome} />;
    if (activePage === "study") return <StudyScreen onBack={goHome} />;
    if (activePage === "calendar") return <CalendarScreen onBack={goHome} />;
    return <ComingSoon nameAr="قريبًا" nameEn={activePage} onBack={goHome} />;
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
