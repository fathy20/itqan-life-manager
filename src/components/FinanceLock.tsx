import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Eye, EyeOff, Wallet, X } from 'lucide-react';
import { cn } from '../lib/utils';

const FINANCE_PIN_KEY = 'itqan_finance_pin';
const FINANCE_UNLOCKED_KEY = 'itqan_finance_unlocked';

interface Props {
  children: React.ReactNode;
}

export default function FinanceLock({ children }: Props) {
  const savedPin = localStorage.getItem(FINANCE_PIN_KEY);
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(FINANCE_UNLOCKED_KEY) === 'true');
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'unlock' | 'set-pin'>(savedPin ? 'unlock' : 'set-pin');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // Lock again when leaving finance page (optional - session based)
  useEffect(() => {
    return () => {
      // keep unlocked during session
    };
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === savedPin) {
      sessionStorage.setItem(FINANCE_UNLOCKED_KEY, 'true');
      setUnlocked(true);
      setShowModal(false);
      setPin('');
      setError('');
    } else {
      setError('الباسورد غلط، حاول تاني');
      triggerShake();
      setPin('');
    }
  };

  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) { setError('الباسورد لازم يكون 4 أرقام على الأقل'); return; }
    if (pin !== confirmPin) { setError('الباسورد مش متطابق'); triggerShake(); return; }
    localStorage.setItem(FINANCE_PIN_KEY, pin);
    sessionStorage.setItem(FINANCE_UNLOCKED_KEY, 'true');
    setUnlocked(true);
    setShowModal(false);
    setPin('');
    setConfirmPin('');
    setError('');
  };

  const handleLock = () => {
    sessionStorage.removeItem(FINANCE_UNLOCKED_KEY);
    setUnlocked(false);
  };

  if (unlocked) {
    return (
      <div className="relative">
        {/* Lock button top */}
        <button
          onClick={handleLock}
          className="fixed bottom-28 left-6 md:bottom-8 md:left-8 z-40 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-xl text-xs font-bold text-white/40 hover:text-red-400 transition-all"
        >
          <Lock size={14} />
          قفل الماليات
        </button>
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Blurred preview */}
      <div className="relative select-none">
        <div className="blur-xl pointer-events-none opacity-40 overflow-hidden max-h-[80vh]">
          {children}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Lock size={36} className="text-brand-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black">الماليات محمية 🔒</h3>
              <p className="text-white/40 text-sm mt-1">ادخل الباسورد عشان تشوف بياناتك المالية</p>
            </div>
            <button
              onClick={() => { setMode(savedPin ? 'unlock' : 'set-pin'); setShowModal(true); }}
              className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
            >
              <Unlock size={18} />
              {savedPin ? 'فتح الماليات' : 'تعيين باسورد'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* PIN Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowModal(false); setPin(''); setConfirmPin(''); setError(''); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn("relative w-full max-w-sm glass-card p-8 transition-all", shake && "animate-[shake_0.4s_ease-in-out]")}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <h3 className="text-xl font-bold">
                    {mode === 'unlock' ? 'فتح الماليات' : 'تعيين باسورد'}
                  </h3>
                </div>
                <button onClick={() => { setShowModal(false); setPin(''); setConfirmPin(''); setError(''); }}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/40">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={mode === 'unlock' ? handleUnlock : handleSetPin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">
                    {mode === 'unlock' ? 'الباسورد' : 'باسورد جديد (4 أرقام على الأقل)'}
                  </label>
                  <div className="relative">
                    <input
                      autoFocus
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={e => { setPin(e.target.value); setError(''); }}
                      placeholder="••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold tracking-widest outline-none focus:border-brand-500/50 transition-colors pr-12"
                    />
                    <button type="button" onClick={() => setShowPin(!showPin)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {mode === 'set-pin' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">تأكيد الباسورد</label>
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={e => { setConfirmPin(e.target.value); setError(''); }}
                      placeholder="••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold tracking-widest outline-none focus:border-brand-500/50 transition-colors"
                    />
                  </div>
                )}

                {error && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg">
                    {error}
                  </motion.p>
                )}

                <button type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all">
                  {mode === 'unlock' ? 'فتح' : 'حفظ الباسورد'}
                </button>

                {mode === 'unlock' && (
                  <button type="button"
                    onClick={() => { setMode('set-pin'); setPin(''); setError(''); }}
                    className="w-full text-xs text-white/30 hover:text-white/50 transition-colors py-1">
                    نسيت الباسورد؟ عيّن باسورد جديد
                  </button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </>
  );
}
