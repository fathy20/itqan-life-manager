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
import { signOut } from 'firebase/auth';
import { auth } from './lib/firebase';

function AppInner() {
  const { currentUser, state } = useApp();
  const [activePage, setActivePage] = useState('dashboard');
  const isOnboarded = !!state.profile?.name;

  if (!currentUser) return <AuthScreen />;
  if (!isOnboarded) return <Onboarding onComplete={() => {}} />;

  const navigate = (id: string) => setActivePage(id);
  const logout = () => signOut(auth);

  if (activePage === 'dashboard') return <HomeScreen onNavigate={navigate} onLogout={logout} />;
  if (activePage === 'salah')    return <SalahSystem onBack={() => navigate('dashboard')} />;
  if (activePage === 'quran')    return <QuranScreen />;
  if (activePage === 'adhkar')   return <AdhkarSystem onBack={() => navigate('dashboard')} />;
  if (activePage === 'sibaq')    return <SibaqSystem onBack={() => navigate('dashboard')} />;
  if (activePage === 'fasting')  return <FastingSystem onBack={() => navigate('dashboard')} />;

  // Unimplemented screens fall back to dashboard
  return <HomeScreen onNavigate={navigate} onLogout={logout} />;
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
