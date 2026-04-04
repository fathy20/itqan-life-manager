import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { profileApi, subjectsApi, lifestyleApi } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Plus, Trash2, Sparkles } from 'lucide-react';

const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";
const ar = "'Noto Kufi Arabic', sans-serif";

const STEP_LABELS = ['الروحانيات', 'معلوماتك', 'المواد', 'العمل', 'العادات'];

const DEFAULT_HABITS = [
  { name: 'Wake for Fajr', nameAr: 'الاستيقاظ للفجر', selected: true },
  { name: 'Morning adhkar', nameAr: 'أذكار الصباح', selected: true },
  { name: 'Read Quran', nameAr: 'قراءة القرآن', selected: true },
  { name: 'Exercise', nameAr: 'رياضة', selected: false },
  { name: 'Sleep before 11', nameAr: 'النوم قبل 11', selected: true },
  { name: 'Drink water', nameAr: 'شرب الماء', selected: true },
  { name: 'Siwak', nameAr: 'السواك', selected: false },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0
  const [prayerHabit, setPrayerHabit] = useState('');
  const [quranHabit, setQuranHabit] = useState('');
  const [adhkarHabit, setAdhkarHabit] = useState('');

  // Step 1
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [university, setUniversity] = useState('');
  const [role, setRole] = useState('');

  // Step 2
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subForm, setSubForm] = useState({ name: '', examDate: '', difficulty: 3, totalLectures: 12 });

  // Step 3
  const [courses, setCourses] = useState<any[]>([]);
  const [courseForm, setCourseForm] = useState({ name: '', platform: '', totalLessons: 20 });

  // Step 4
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [customHabit, setCustomHabit] = useState('');

  const canNext = () => {
    if (step === 0) return prayerHabit && quranHabit && adhkarHabit;
    if (step === 1) return name.trim() && role;
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Save profile
      await profileApi.update({
        displayName: name,
        university,
        role: role as any,
        onboardingCompleted: true,
        language: 'ar',
        timezone: 'Africa/Cairo',
        prayerMethod: 5,
      } as any);

      // Save subjects
      for (const s of subjects) {
        await subjectsApi.create({ ...s, completedLectures: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }

      // Save habits
      const selectedHabits = habits.filter(h => h.selected);
      for (const h of selectedHabits) {
        await lifestyleApi.create({ name: h.name });
      }

      onComplete();
    } catch (err) {
      console.error('Onboarding error:', err);
      onComplete(); // proceed anyway
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${CYAN}15`, border: `1px solid ${CYAN}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Sparkles size={22} color={CYAN} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: BRIGHT, fontFamily: ar, margin: 0 }}>إعداد حسابك</h1>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>خطوة {step + 1} من {STEP_LABELS.length}</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 4, borderRadius: 2, background: i <= step ? CYAN : BORDER, transition: 'background 0.3s', marginBottom: 4 }} />
              <span style={{ fontSize: 9, color: i === step ? CYAN : MUTED, fontFamily: ar }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
            style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 28 }}>

            {/* Step 0: Spiritual */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: BRIGHT, fontFamily: ar, margin: 0 }}>الجانب الروحاني</h2>
                {[
                  { label: 'عادتك مع الصلاة؟', state: prayerHabit, set: setPrayerHabit, options: ['دايماً في وقتها', 'في الغالب', 'بشتغل عليها'] },
                  { label: 'عادتك مع القرآن؟', state: quranHabit, set: setQuranHabit, options: ['يومياً', 'أسبوعياً', 'عاوز أبدأ'] },
                  { label: 'عادتك مع الأذكار؟', state: adhkarHabit, set: setAdhkarHabit, options: ['يومياً', 'أحياناً', 'عاوز أبدأ'] },
                ].map(q => (
                  <div key={q.label}>
                    <p style={{ fontSize: 13, color: TEXT, fontFamily: ar, marginBottom: 10 }}>{q.label}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {q.options.map(opt => (
                        <button key={opt} type="button" onClick={() => q.set(opt)} style={{
                          padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: ar,
                          background: q.state === opt ? `${CYAN}20` : 'transparent',
                          border: `1px solid ${q.state === opt ? CYAN : BORDER}`,
                          color: q.state === opt ? CYAN : MUTED, transition: 'all 0.2s',
                        }}>{opt}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: BRIGHT, fontFamily: ar, margin: 0 }}>معلوماتك الشخصية</h2>
                {[
                  { label: 'اسمك', value: name, set: setName, placeholder: 'مثال: فتحي' },
                  { label: 'الجامعة (اختياري)', value: university, set: setUniversity, placeholder: 'مثال: جامعة القاهرة' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 11, color: MUTED, display: 'block', marginBottom: 6, fontFamily: ar }}>{f.label}</label>
                    <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, color: MUTED, display: 'block', marginBottom: 8, fontFamily: ar }}>دورك الحالي</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ id: 'student', label: 'طالب' }, { id: 'employee', label: 'موظف' }, { id: 'freelancer', label: 'فريلانسر' }].map(r => (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)} style={{
                        flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: ar,
                        background: role === r.id ? `${CYAN}20` : 'transparent',
                        border: `1px solid ${role === r.id ? CYAN : BORDER}`,
                        color: role === r.id ? CYAN : MUTED,
                      }}>{r.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Subjects */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: BRIGHT, fontFamily: ar, margin: 0 }}>المواد الدراسية</h2>
                <p style={{ fontSize: 12, color: MUTED, margin: 0, fontFamily: ar }}>أضف مواد الترم الحالي (اختياري)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <input value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} placeholder="اسم المادة" style={inputStyle} />
                  </div>
                  <input type="date" value={subForm.examDate} onChange={e => setSubForm({ ...subForm, examDate: e.target.value })} style={inputStyle} />
                  <input type="number" min="1" value={subForm.totalLectures} onChange={e => setSubForm({ ...subForm, totalLectures: +e.target.value })} placeholder="عدد المحاضرات" style={inputStyle} />
                </div>
                <button type="button" onClick={() => { if (!subForm.name.trim()) return; setSubjects([...subjects, { ...subForm, difficulty: subForm.difficulty }]); setSubForm({ name: '', examDate: '', difficulty: 3, totalLectures: 12 }); }} style={{ padding: '10px', borderRadius: 8, background: `${CYAN}15`, border: `1px solid ${CYAN}25`, color: CYAN, cursor: 'pointer', fontSize: 13, fontFamily: ar, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Plus size={14} /> إضافة مادة
                </button>
                {subjects.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: BG, border: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: 13, color: TEXT, fontFamily: ar }}>{s.name}</span>
                    <button type="button" onClick={() => setSubjects(subjects.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Work */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: BRIGHT, fontFamily: ar, margin: 0 }}>الكورسات والمشاريع</h2>
                <p style={{ fontSize: 12, color: MUTED, margin: 0, fontFamily: ar }}>أضف كورسات التطوير الذاتي (اختياري)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="اسم الكورس" style={inputStyle} />
                  <input value={courseForm.platform} onChange={e => setCourseForm({ ...courseForm, platform: e.target.value })} placeholder="المنصة (Udemy...)" style={inputStyle} />
                </div>
                <button type="button" onClick={() => { if (!courseForm.name.trim()) return; setCourses([...courses, courseForm]); setCourseForm({ name: '', platform: '', totalLessons: 20 }); }} style={{ padding: '10px', borderRadius: 8, background: `${CYAN}15`, border: `1px solid ${CYAN}25`, color: CYAN, cursor: 'pointer', fontSize: 13, fontFamily: ar, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Plus size={14} /> إضافة كورس
                </button>
                {courses.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: BG, border: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: 13, color: TEXT }}>{c.name} — {c.platform}</span>
                    <button type="button" onClick={() => setCourses(courses.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Habits */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: BRIGHT, fontFamily: ar, margin: 0 }}>العادات اليومية</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {habits.map((h, i) => (
                    <button key={i} type="button" onClick={() => setHabits(habits.map((x, j) => j === i ? { ...x, selected: !x.selected } : x))} style={{
                      padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'right', fontFamily: ar,
                      background: h.selected ? `${CYAN}15` : 'transparent',
                      border: `1px solid ${h.selected ? CYAN : BORDER}`,
                      color: h.selected ? CYAN : MUTED, fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: h.selected ? CYAN : 'transparent', border: `1px solid ${h.selected ? CYAN : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {h.selected && <Check size={11} color="#000E30" />}
                      </div>
                      {h.nameAr}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={customHabit} onChange={e => setCustomHabit(e.target.value)} placeholder="عادة مخصصة..." style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => { if (!customHabit.trim()) return; setHabits([...habits, { name: customHabit, nameAr: customHabit, selected: true }]); setCustomHabit(''); }} style={{ padding: '10px 16px', borderRadius: 8, background: `${CYAN}15`, border: `1px solid ${CYAN}25`, color: CYAN, cursor: 'pointer' }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} style={{ padding: '12px 20px', borderRadius: 10, background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <ChevronRight size={16} /> رجوع
            </button>
          )}
          <button type="button" disabled={!canNext() || loading} onClick={() => step < 4 ? setStep(step + 1) : handleFinish()} style={{
            flex: 1, padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: (!canNext() || loading) ? 'not-allowed' : 'pointer',
            background: (!canNext() || loading) ? MUTED : CYAN, border: 'none', color: '#000E30',
            fontFamily: ar, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: canNext() && !loading ? `0 0 20px ${CYAN}30` : 'none',
          }}>
            {loading ? 'جاري الحفظ...' : step < 4 ? <><span>التالي</span><ChevronLeft size={16} /></> : <><Sparkles size={16} /><span>ابدأ رحلتك</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 8, fontSize: 13,
  background: BG, border: `1px solid ${BORDER}`, color: BRIGHT,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
