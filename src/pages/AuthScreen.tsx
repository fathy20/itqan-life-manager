import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BG = "#000E30";
const CARD = "#071A3A";
const BORDER = "#0C2550";
const CYAN = "#08A7E7";
const MUTED = "#3D5A80";
const TEXT = "#C0C8D8";
const BRIGHT = "#E8EBF0";

const ERROR_MESSAGES: Record<string, string> = {
  'auth/wrong-password': 'كلمة السر غلط',
  'auth/invalid-credential': 'الإيميل أو كلمة السر غلط',
  'auth/user-not-found': 'الحساب ده مش موجود',
  'auth/email-already-in-use': 'الإيميل ده مستخدم قبل كده',
  'auth/weak-password': 'كلمة السر ضعيفة (6 أحرف على الأقل)',
  'auth/invalid-email': 'الإيميل مش صحيح',
  'auth/too-many-requests': 'محاولات كتير، استنى شوية',
  'auth/network-request-failed': 'مشكلة في الاتصال بالإنترنت',
};

export default function AuthScreen() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (tab === 'register') {
        if (!name.trim()) { setErrorMsg('اكتب اسمك الأول'); setLoading(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setErrorMsg(ERROR_MESSAGES[err.code] || 'حدث خطأ، حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: `${CYAN}15`, border: `1px solid ${CYAN}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 0 30px ${CYAN}15` }}>
            <Sparkles size={28} color={CYAN} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: BRIGHT, fontFamily: "'Noto Kufi Arabic', sans-serif", margin: 0 }}>إتقان</h1>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>نظام إدارة الحياة الذكي</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: CARD, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}`, marginBottom: 24 }}>
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setErrorMsg(''); }} style={{
              flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: tab === t ? CYAN : 'transparent',
              color: tab === t ? '#000E30' : MUTED,
              fontFamily: "'Noto Kufi Arabic', sans-serif",
            }}>
              {t === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence>
            {tab === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <label style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>اسمك</label>
                <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="مثال: فتحي" style={inputStyle} />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>الإيميل</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>كلمة السر</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingLeft: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '10px 14px', borderRadius: 8, background: '#F8717110', border: '1px solid #F8717125', color: '#F87171', fontSize: 13, textAlign: 'center', fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading} style={{
            padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? MUTED : CYAN, border: 'none', color: '#000E30', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'Noto Kufi Arabic', sans-serif",
            boxShadow: loading ? 'none' : `0 0 20px ${CYAN}30`,
          }}>
            {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'جاري...' : tab === 'login' ? 'دخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 14,
  background: '#071A3A', border: '1px solid #0C2550', color: '#E8EBF0',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};
