import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { EMPTY_STATE, FATHY_PRESET } from '../constants';
import { AppState } from '../types';
import { cn } from '../lib/utils';
import {
  User, BookOpen, Briefcase, Heart, ChevronRight,
  ChevronLeft, Plus, Trash2, Check, Sparkles
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'بياناتك', icon: User },
  { id: 2, label: 'المواد', icon: BookOpen },
  { id: 3, label: 'العمل', icon: Briefcase },
  { id: 4, label: 'العادات', icon: Heart },
];

const COLORS = ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316'];
const DIFFICULTIES = [
  { id: 'easy', label: 'سهل', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'medium', label: 'متوسط', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { id: 'hard', label: 'صعب', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
];

type SubjectForm = { name: string; examDate: string; totalLectures: number; completedLectures: number; difficulty: 'easy'|'medium'|'hard'; color: string; };
type ProjectForm = { name: string; type: 'work'|'freelance'; color: string; };
type CourseForm = { name: string; platform: string; totalHours: number; completedHours: number; weeklyGoalHours: number; color: string; };
type HabitForm = { name: string; icon: string; category: 'spiritual'|'health'|'study'|'work'|'personal'; };

const DEFAULT_HABITS: HabitForm[] = [
  { name: 'صلاة في وقتها', icon: '🕌', category: 'spiritual' },
  { name: 'ورد يومي', icon: '📖', category: 'spiritual' },
  { name: 'مشي 20 دقيقة', icon: '🚶', category: 'health' },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { resetState } = useApp();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');
  const [semester, setSemester] = useState('');

  // Step 2
  const [subjects, setSubjects] = useState<SubjectForm[]>([]);
  const [subForm, setSubForm] = useState<SubjectForm>({ name: '', examDate: '', totalLectures: 12, completedLectures: 0, difficulty: 'medium', color: COLORS[0] });

  // Step 3
  const [projects, setProjects] = useState<ProjectForm[]>([]);
  const [projForm, setProjForm] = useState<ProjectForm>({ name: '', type: 'work', color: COLORS[1] });
  const [courses, setCourses] = useState<CourseForm[]>([]);
  const [courseForm, setCourseForm] = useState<CourseForm>({ name: '', platform: '', totalHours: 20, completedHours: 0, weeklyGoalHours: 4, color: COLORS[2] });

  // Step 4
  const [habits, setHabits] = useState<HabitForm[]>(DEFAULT_HABITS);
  const [habitForm, setHabitForm] = useState<HabitForm>({ name: '', icon: '⭐', category: 'personal' });

  const isFathy = ['fathy', 'فتحي', 'fathi'].includes(name.trim().toLowerCase().replace(/\s/g, ''));

  // Auto-fill Fathy's profile when name matches
  React.useEffect(() => {
    if (isFathy && !university) {
      setUniversity('Egyptian Chinese University');
      setFaculty('Faculty of Engineering and Technology - Software Engineering');
      setLevel('Senior-1');
      setSemester('Spring 2026');
      setRole('طالب + موظف + فريلانسر');
    }
  }, [isFathy]);

  const handleFinish = () => {
    const base: AppState = { ...EMPTY_STATE };
    const isFathyUser = isFathy;

    const finalState: AppState = {
      ...base,
      ...(isFathyUser ? FATHY_PRESET : {}),
      profile: {
        name: name.trim(),
        university: university.trim() || (isFathyUser ? 'Egyptian Chinese University' : ''),
        faculty: faculty.trim() || (isFathyUser ? 'Faculty of Engineering and Technology' : ''),
        program: '',
        level: level.trim(),
        semester: semester.trim(),
        role: role.trim(),
        timezone: 'Africa/Cairo',
        locale: 'ar-EG',
      },
      subjects: isFathyUser && subjects.length === 0
        ? (FATHY_PRESET.subjects || [])
        : subjects.map((s, i) => ({ ...s, id: `s${i}` })),
      projects: isFathyUser && projects.length === 0
        ? (FATHY_PRESET.projects || [])
        : projects.map((p, i) => ({ ...p, id: `p${i}`, priority: 'medium', status: 'ongoing' as const })),
      courses: isFathyUser && courses.length === 0
        ? (FATHY_PRESET.courses || [])
        : courses.map((c, i) => ({ ...c, id: `c${i}` })),
      habits: habits.map((h, i) => ({ ...h, id: `h${i}`, frequency: 'daily' as const, streak: 0, completedDates: [] })),
      tasks: isFathyUser ? (FATHY_PRESET.tasks || []) : [],
      // Finance always empty
      transactions: [],
      wishlist: [],
      commitments: [],
      monthlySalary: 0,
    };

    resetState(finalState);
    localStorage.setItem('itqan_onboarded', 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4" dir="rtl">
      {/* Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  step > s.id ? "bg-brand-500 border-brand-500 text-white" :
                  step === s.id ? "border-brand-500 text-brand-400 bg-brand-500/10" :
                  "border-white/10 text-white/20"
                )}>
                  {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
                </div>
                <span className={cn("text-[10px] font-bold", step >= s.id ? "text-white/60" : "text-white/20")}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2 mb-5 transition-all", step > s.id ? "bg-brand-500" : "bg-white/10")} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl"
        >
          {/* ===== STEP 1: Profile ===== */}
          {step === 1 && (
            <div className="glass-card p-8 space-y-6">
              <div className="text-center mb-2">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-3xl font-black">أهلاً بك في إتقان 👋</h1>
                <p className="text-white/40 mt-2">خليني أتعرف عليك عشان أبني نظامك الشخصي</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">اسمك *</label>
                  <input autoFocus value={name} onChange={e => setName(e.target.value)}
                    placeholder="مثال: فتحي أو Fathy"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold outline-none focus:border-brand-500/50 transition-colors" />
                  {isFathy && name && (
                    <p className="text-xs text-brand-400 font-bold flex items-center gap-1">
                      <Sparkles size={12} /> أهلاً فتحي! هجيب بياناتك الجاهزة تلقائياً ✨
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">الجامعة</label>
                  <input value={university} onChange={e => setUniversity(e.target.value)}
                    placeholder="اسم الجامعة"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">الكلية / التخصص</label>
                  <input value={faculty} onChange={e => setFaculty(e.target.value)}
                    placeholder="مثال: هندسة برمجيات"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">المستوى / السنة</label>
                  <input value={level} onChange={e => setLevel(e.target.value)}
                    placeholder="مثال: Senior-1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">الفصل الدراسي</label>
                  <input value={semester} onChange={e => setSemester(e.target.value)}
                    placeholder="مثال: Spring 2026"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">دورك الحالي</label>
                  <div className="flex flex-wrap gap-2">
                    {['طالب', 'موظف', 'فريلانسر', 'طالب + موظف', 'طالب + فريلانسر', 'طالب + موظف + فريلانسر'].map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className={cn("px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                          role === r ? "bg-brand-500/20 border-brand-500/50 text-brand-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
                        )}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button disabled={!name.trim()} onClick={() => setStep(2)}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                التالي <ChevronLeft size={20} />
              </button>
            </div>
          )}

          {/* ===== STEP 2: Subjects ===== */}
          {step === 2 && (
            <div className="glass-card p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black">المواد الدراسية 📚</h2>
                <p className="text-white/40 mt-1 text-sm">أضف مواد الترم الحالي ومواعيد امتحاناتها</p>
                {isFathy && <p className="text-brand-400 text-xs font-bold mt-1">✨ مواد فتحي جاهزة - تقدر تضيف أو تكمل</p>}
              </div>

              {/* Add subject form */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <input value={subForm.name} onChange={e => setSubForm({...subForm, name: e.target.value})}
                      placeholder="اسم المادة *"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 font-bold uppercase mb-1 block">تاريخ الامتحان</label>
                    <input type="date" value={subForm.examDate} onChange={e => setSubForm({...subForm, examDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 font-bold uppercase mb-1 block">عدد المحاضرات</label>
                    <input type="number" min="1" value={subForm.totalLectures} onChange={e => setSubForm({...subForm, totalLectures: +e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 font-bold uppercase mb-1 block">المنجز منها</label>
                    <input type="number" min="0" max={subForm.totalLectures} value={subForm.completedLectures} onChange={e => setSubForm({...subForm, completedLectures: +e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 font-bold uppercase mb-1 block">الصعوبة</label>
                    <div className="flex gap-2">
                      {DIFFICULTIES.map(d => (
                        <button key={d.id} type="button" onClick={() => setSubForm({...subForm, difficulty: d.id as any})}
                          className={cn("flex-1 py-2 rounded-lg text-xs font-bold border transition-all", subForm.difficulty === d.id ? d.color : "bg-white/5 border-white/10 text-white/30")}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 font-bold uppercase mb-1 block">اللون</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setSubForm({...subForm, color: c})}
                          className={cn("w-7 h-7 rounded-full border-2 transition-all", subForm.color === c ? "border-white scale-110" : "border-transparent")}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => { if (!subForm.name.trim()) return; setSubjects([...subjects, subForm]); setSubForm({name:'',examDate:'',totalLectures:12,completedLectures:0,difficulty:'medium',color:COLORS[subjects.length % COLORS.length]}); }}
                  className="w-full py-2.5 bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-brand-500/20">
                  <Plus size={16} /> إضافة المادة
                </button>
              </div>

              {/* List */}
              {subjects.length > 0 && (
                <div className="space-y-2">
                  {subjects.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{s.name}</div>
                        <div className="text-[10px] text-white/30">{s.examDate || 'بدون تاريخ'} · {s.completedLectures}/{s.totalLectures} محاضرة</div>
                      </div>
                      <button onClick={() => setSubjects(subjects.filter((_,j)=>j!==i))} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              {subjects.length === 0 && isFathy && (
                <p className="text-center text-white/20 text-xs py-2">سيتم استخدام مواد فتحي الافتراضية تلقائياً</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="glass-button px-6 py-3 flex items-center gap-2 text-white/40"><ChevronRight size={18} /> رجوع</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  التالي <ChevronLeft size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 3: Projects & Courses ===== */}
          {step === 3 && (
            <div className="glass-card p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black">العمل والكورسات 💼</h2>
                <p className="text-white/40 mt-1 text-sm">مشاريعك الحالية وكورسات التطوير الذاتي</p>
                {isFathy && <p className="text-brand-400 text-xs font-bold mt-1">✨ مشاريع وكورسات فتحي جاهزة</p>}
              </div>

              {/* Projects */}
              <div>
                <h3 className="text-sm font-bold text-white/60 mb-3 flex items-center gap-2"><Briefcase size={14} /> المشاريع</h3>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <div className="flex gap-3">
                    <input value={projForm.name} onChange={e => setProjForm({...projForm, name: e.target.value})}
                      placeholder="اسم المشروع"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500/50" />
                    <select value={projForm.type} onChange={e => setProjForm({...projForm, type: e.target.value as any})}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none">
                      <option value="work">وظيفة</option>
                      <option value="freelance">فريلانس</option>
                    </select>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setProjForm({...projForm, color: c})}
                        className={cn("w-6 h-6 rounded-full border-2 transition-all", projForm.color === c ? "border-white scale-110" : "border-transparent")}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <button onClick={() => { if (!projForm.name.trim()) return; setProjects([...projects, projForm]); setProjForm({name:'',type:'work',color:COLORS[projects.length%COLORS.length]}); }}
                    className="w-full py-2 bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-brand-500/20">
                    <Plus size={14} /> إضافة مشروع
                  </button>
                </div>
                {projects.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 mt-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="flex-1 text-sm font-bold">{p.name}</span>
                    <span className="text-[10px] text-white/30">{p.type === 'work' ? 'وظيفة' : 'فريلانس'}</span>
                    <button onClick={() => setProjects(projects.filter((_,j)=>j!==i))} className="text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              {/* Courses */}
              <div>
                <h3 className="text-sm font-bold text-white/60 mb-3 flex items-center gap-2"><BookOpen size={14} /> الكورسات</h3>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})}
                      placeholder="اسم الكورس"
                      className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500/50" />
                    <input value={courseForm.platform} onChange={e => setCourseForm({...courseForm, platform: e.target.value})}
                      placeholder="المنصة (مثال: Udemy)"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500/50" />
                    <input type="number" min="1" value={courseForm.totalHours} onChange={e => setCourseForm({...courseForm, totalHours: +e.target.value})}
                      placeholder="إجمالي الساعات"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500/50" />
                  </div>
                  <button onClick={() => { if (!courseForm.name.trim()) return; setCourses([...courses, courseForm]); setCourseForm({name:'',platform:'',totalHours:20,completedHours:0,weeklyGoalHours:4,color:COLORS[courses.length%COLORS.length]}); }}
                    className="w-full py-2 bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-brand-500/20">
                    <Plus size={14} /> إضافة كورس
                  </button>
                </div>
                {courses.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 mt-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="flex-1 text-sm font-bold">{c.name}</span>
                    <span className="text-[10px] text-white/30">{c.totalHours} ساعة</span>
                    <button onClick={() => setCourses(courses.filter((_,j)=>j!==i))} className="text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="glass-button px-6 py-3 flex items-center gap-2 text-white/40"><ChevronRight size={18} /> رجوع</button>
                <button onClick={() => setStep(4)} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  التالي <ChevronLeft size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 4: Habits ===== */}
          {step === 4 && (
            <div className="glass-card p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black">العادات اليومية 🌟</h2>
                <p className="text-white/40 mt-1 text-sm">حدد العادات اللي عاوز تتابعها كل يوم</p>
              </div>

              <div className="space-y-2">
                {habits.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xl">{h.icon}</span>
                    <span className="flex-1 text-sm font-bold">{h.name}</span>
                    <span className="text-[10px] text-white/30">{h.category}</span>
                    <button onClick={() => setHabits(habits.filter((_,j)=>j!==i))} className="text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex gap-3">
                  <input value={habitForm.icon} onChange={e => setHabitForm({...habitForm, icon: e.target.value})}
                    className="w-14 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center text-xl outline-none" />
                  <input value={habitForm.name} onChange={e => setHabitForm({...habitForm, name: e.target.value})}
                    placeholder="اسم العادة"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500/50" />
                  <select value={habitForm.category} onChange={e => setHabitForm({...habitForm, category: e.target.value as any})}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none">
                    <option value="spiritual">روحاني</option>
                    <option value="health">صحة</option>
                    <option value="study">دراسة</option>
                    <option value="work">عمل</option>
                    <option value="personal">شخصي</option>
                  </select>
                </div>
                <button onClick={() => { if (!habitForm.name.trim()) return; setHabits([...habits, habitForm]); setHabitForm({name:'',icon:'⭐',category:'personal'}); }}
                  className="w-full py-2 bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-brand-500/20">
                  <Plus size={14} /> إضافة عادة
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="glass-button px-6 py-3 flex items-center gap-2 text-white/40"><ChevronRight size={18} /> رجوع</button>
                <button onClick={handleFinish}
                  className="flex-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20">
                  <Sparkles size={18} /> ابدأ رحلتك مع إتقان
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
