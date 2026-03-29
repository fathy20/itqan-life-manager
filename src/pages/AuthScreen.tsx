import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { Eye, EyeOff, Sparkles, LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!displayName.trim()) { setError('اكتب اسمك'); setLoading(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: displayName.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      const msg: Record<string, string> = {
        'auth/email-already-in-use': 'الإيميل ده مسجل قبل كده',
        'auth/invalid-email': 'إيميل غير صحيح',
        'auth/weak-password': 'الباسورد ضعيف (6 أحرف على الأقل)',
        'auth/user-not-found': 'مفيش حساب بالإيميل ده',
        'auth/wrong-password': 'باسورد غلط',
        'auth/invalid-credential': 'إيميل أو باسورد غلط',
        'auth/too-many-requests': 'محاولات كتير، استنى شوية',
      };
      setError(msg[err.code] || 'حدث خطأ، حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
            <Sparkles size={32} className="text-brand-400" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">إتقان</h1>
          <p className="text-white/40 mt-2 text-sm">نظام إدارة الحياة الذكي</p>
        </motion.div>

        {/* Toggle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mb-6">
          <button onClick={() => { setMode('login'); setError(''); }}
            className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              mode === 'login' ? "bg-brand-500 text-white shadow-lg" : "text-white/40 hover:text-white/60")}>
            <LogIn size={16} /> تسجيل الدخول
          </button>
          <button onClick={() => { setMode('register'); setError(''); }}
            className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              mode === 'register' ? "bg-brand-500 text-white shadow-lg" : "text-white/40 hover:text-white/60")}>
            <UserPlus size={16} /> حساب جديد
          </button>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden">
                  <label className="text-xs font-bold text-white/40 uppercase">اسمك</label>
                  <input autoFocus value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="مثال: فتحي"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors text-lg font-bold" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">الإيميل</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">الباسورد</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2.5 rounded-xl border border-red-500/20">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={20} className="animate-spin" /> : mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              {loading ? 'جاري...' : mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
