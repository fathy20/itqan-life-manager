import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap, 
  Coffee, 
  Brain,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const FocusTimer: React.FC = () => {
  const [mode, setMode] = useState<'pomodoro' | 'short-break' | 'long-break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const settings = {
    pomodoro: 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60,
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'pomodoro') {
        setSessionsCompleted(prev => prev + 1);
        // Play sound or notification
      }
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[mode]);
  };

  const changeMode = (newMode: typeof mode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(settings[newMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((settings[mode] - timeLeft) / settings[mode]) * 100;

  const quotes = [
    "ركز على الخطوة الحالية فقط.",
    "العمل العميق هو مفتاح الإبداع.",
    "أنت تبلي بلاءً حسناً، استمر!",
    "كل دقيقة تركيز تقربك من هدفك.",
    "تخلص من المشتتات، العالم سينتظر."
  ];

  const [currentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black">مؤقت التركيز</h2>
        <p className="text-white/40">{currentQuote}</p>
      </div>

      {/* Timer Display */}
      <div className="relative aspect-square max-w-md mx-auto flex items-center justify-center">
        {/* Progress Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            className="stroke-white/5 fill-none"
            strokeWidth="4"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="48%"
            className={cn(
              "fill-none transition-colors duration-500",
              mode === 'pomodoro' ? "stroke-brand-500" : "stroke-emerald-500"
            )}
            strokeWidth="4"
            strokeDasharray="301.59"
            animate={{ strokeDashoffset: 301.59 - (301.59 * progress) / 100 }}
            strokeLinecap="round"
          />
        </svg>

        <div className="text-center z-10">
          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-black font-mono tracking-tighter"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className="text-white/40 font-bold uppercase tracking-widest mt-2">
            {mode === 'pomodoro' ? 'وقت العمل' : 'وقت الراحة'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-8">
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
          {[
            { id: 'pomodoro', label: 'تركيز', icon: Brain },
            { id: 'short-break', label: 'راحة قصيرة', icon: Coffee },
            { id: 'long-break', label: 'راحة طويلة', icon: Zap },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => changeMode(item.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold text-sm",
                mode === item.id ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white/60"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-full glass-button flex items-center justify-center text-white/60 hover:text-white"
          >
            <RotateCcw size={24} />
          </button>

          <button 
            onClick={toggleTimer}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95",
              isActive ? "bg-white text-black" : "bg-brand-500 text-white"
            )}
          >
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="mr-2" />}
          </button>

          <button className="w-14 h-14 rounded-full glass-button flex items-center justify-center text-white/60 hover:text-white">
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">{sessionsCompleted}</div>
            <div className="text-xs text-white/40 font-bold uppercase">جلسات اليوم</div>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Zap size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">{sessionsCompleted * 25} د</div>
            <div className="text-xs text-white/40 font-bold uppercase">إجمالي وقت التركيز</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
