import { useState } from "react";
import type { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Check, ChevronLeft, ChevronRight, LogOut, Plus, Sparkles, Trash2 } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { useApp } from "../context/AppContext";
import type { AppState, LegacyCourse, LegacySubject } from "../types";

const steps = ["الروحانيات", "معلوماتك", "المواد", "التعلم", "العادات"];

const defaultHabits = [
  { name: "Wake for Fajr", nameAr: "الاستيقاظ للفجر", selected: true },
  { name: "Morning adhkar", nameAr: "أذكار الصباح", selected: true },
  { name: "Read Quran", nameAr: "قراءة القرآن", selected: true },
  { name: "Exercise", nameAr: "رياضة", selected: false },
  { name: "Sleep before 11", nameAr: "النوم قبل 11", selected: true },
  { name: "Drink water", nameAr: "شرب الماء", selected: true },
  { name: "Siwak", nameAr: "السواك", selected: false },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { state, setState } = useApp();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [prayerHabit, setPrayerHabit] = useState("في الغالب");
  const [quranHabit, setQuranHabit] = useState("عاوز أبدأ");
  const [adhkarHabit, setAdhkarHabit] = useState("أحيانًا");

  const [name, setName] = useState(auth.currentUser?.displayName || "");
  const [university, setUniversity] = useState("");
  const [role, setRole] = useState("student");

  const [subjects, setSubjects] = useState<Omit<LegacySubject, "id">[]>([]);
  const [subjectForm, setSubjectForm] = useState({ name: "", examDate: "", difficulty: 3, totalLectures: 12 });

  const [courses, setCourses] = useState<Omit<LegacyCourse, "id" | "progress">[]>([]);
  const [courseForm, setCourseForm] = useState({ name: "", platform: "", totalLessons: 20 });

  const [habits, setHabits] = useState(defaultHabits);
  const [customHabit, setCustomHabit] = useState("");

  const canContinue = step !== 1 || Boolean(name.trim() && role);

  const next = () => {
    setError("");
    if (!canContinue) {
      setError("اكتب اسمك واختار دورك الحالي عشان نكمل.");
      return;
    }
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    void finish();
  };

  const finish = async () => {
    setLoading(true);
    setError("");
    const uid = auth.currentUser?.uid;
    const genId = () => Math.random().toString(36).slice(2, 11);

    const nextState: AppState = {
      ...state,
      profile: {
        ...state.profile,
        name: name.trim() || auth.currentUser?.displayName || "مستخدم إتقان",
        university,
        role,
        onboardingCompleted: true,
      },
      subjects: [
        ...state.subjects,
        ...subjects.map((subject) => ({
          ...subject,
          id: genId(),
          completedLectures: subject.completedLectures ?? 0,
        })),
      ],
      courses: [
        ...state.courses,
        ...courses.map((course) => ({
          ...course,
          id: genId(),
          completedLessons: course.completedLessons ?? 0,
          progress: 0,
        })),
      ],
      habits: [
        ...state.habits,
        ...habits.filter((habit) => habit.selected).map((habit) => ({
          id: genId(),
          name: habit.nameAr || habit.name,
          streak: 0,
          completedDates: [],
        })),
      ],
    };

    setState(nextState);
    localStorage.setItem("itqan_state", JSON.stringify(nextState));

    if (uid) {
      setDoc(doc(db, "users", uid), nextState, { merge: true }).catch((err) => {
        console.warn("Onboarding saved locally but Firestore sync failed:", err);
      });
    }

    setLoading(false);
    onComplete();
  };

  const addSubject = () => {
    if (!subjectForm.name.trim()) {
      setError("اكتب اسم المادة قبل الإضافة.");
      return;
    }
    setSubjects((current) => [...current, { ...subjectForm, name: subjectForm.name.trim(), completedLectures: 0 }]);
    setSubjectForm({ name: "", examDate: "", difficulty: 3, totalLectures: 12 });
    setError("");
  };

  const addCourse = () => {
    if (!courseForm.name.trim()) {
      setError("اكتب اسم الكورس قبل الإضافة.");
      return;
    }
    setCourses((current) => [...current, { ...courseForm, name: courseForm.name.trim(), platform: courseForm.platform.trim() || "Self-study", completedLessons: 0 }]);
    setCourseForm({ name: "", platform: "", totalLessons: 20 });
    setError("");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background px-5 py-8 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <div className="mb-4 flex justify-start">
            <button type="button" onClick={() => signOut(auth)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.06]">
              <LogOut size={16} />
              رجوع لتسجيل الدخول
            </button>
          </div>
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg border border-sky-400/25 bg-sky-400/10 text-sky-300">
            <Sparkles size={25} />
          </div>
          <h1 className="text-3xl font-black">إعداد حسابك</h1>
          <p className="mt-2 text-sm text-slate-500">خطوة {step + 1} من {steps.length}</p>
        </header>

        <div className="mb-7 grid grid-cols-5 gap-2">
          {steps.map((label, index) => (
            <button type="button" key={label} onClick={() => index <= step && setStep(index)} className="text-center">
              <div className={`mb-2 h-1 rounded-full ${index <= step ? "bg-sky-400" : "bg-white/10"}`} />
              <span className={`text-[10px] font-bold ${index === step ? "text-sky-300" : "text-slate-600"}`}>{label}</span>
            </button>
          ))}
        </div>

        <section className="glass-card p-6">
          {step === 0 && (
            <div className="space-y-6">
              <StepTitle title="الجانب الروحاني" text="اختيارات سريعة عشان نبدأ بخطة مناسبة ليك." />
              <ChoiceGroup label="علاقتك مع الصلاة؟" value={prayerHabit} onChange={setPrayerHabit} options={["دائمًا في وقتها", "في الغالب", "بشتغل عليها"]} />
              <ChoiceGroup label="عادتك مع القرآن؟" value={quranHabit} onChange={setQuranHabit} options={["يوميًا", "أسبوعيًا", "عاوز أبدأ"]} />
              <ChoiceGroup label="عادتك مع الأذكار؟" value={adhkarHabit} onChange={setAdhkarHabit} options={["يوميًا", "أحيانًا", "عاوز أبدأ"]} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <StepTitle title="معلوماتك الشخصية" text="الاسم والدور بيساعدوا إتقان يرتب الشاشات حسب يومك." />
              <Field label="اسمك">
                <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: فتحي" autoFocus />
              </Field>
              <Field label="الجامعة أو الجهة">
                <input className="field-input" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="اختياري" />
              </Field>
              <ChoiceGroup label="دورك الحالي" value={role} onChange={setRole} options={[["student", "طالب"], ["employee", "موظف"], ["freelancer", "فريلانسر"]]} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <StepTitle title="المواد الدراسية" text="الخطوة دي اختيارية. تقدر تضيف المواد دلوقتي أو بعدين من شاشة الدراسة." />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="field-input sm:col-span-2" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="اسم المادة" />
                <input className="field-input" type="date" value={subjectForm.examDate} onChange={(e) => setSubjectForm({ ...subjectForm, examDate: e.target.value })} />
                <input className="field-input" type="number" min={1} value={subjectForm.totalLectures} onChange={(e) => setSubjectForm({ ...subjectForm, totalLectures: Number(e.target.value) || 1 })} placeholder="عدد المحاضرات" />
              </div>
              <AddButton onClick={addSubject}>إضافة مادة</AddButton>
              <List items={subjects.map((subject) => subject.name)} onDelete={(index) => setSubjects((current) => current.filter((_, i) => i !== index))} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <StepTitle title="التعلم والكورسات" text="ضيف الكورسات المهمة، أو سيبها فاضية وكمل." />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="field-input" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="اسم الكورس" />
                <input className="field-input" value={courseForm.platform} onChange={(e) => setCourseForm({ ...courseForm, platform: e.target.value })} placeholder="المنصة" />
              </div>
              <AddButton onClick={addCourse}>إضافة كورس</AddButton>
              <List items={courses.map((course) => `${course.name} · ${course.platform || "Self-study"}`)} onDelete={(index) => setCourses((current) => current.filter((_, i) => i !== index))} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <StepTitle title="العادات اليومية" text="اختار العادات اللي عايز تتابعها من أول يوم." />
              <div className="grid gap-2 sm:grid-cols-2">
                {habits.map((habit, index) => (
                  <button
                    type="button"
                    key={`${habit.name}-${index}`}
                    onClick={() => setHabits((current) => current.map((item, i) => i === index ? { ...item, selected: !item.selected } : item))}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-right text-sm font-bold transition ${habit.selected ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 text-slate-400 hover:bg-white/[0.04]"}`}
                  >
                    <span className={`grid h-5 w-5 place-items-center rounded border ${habit.selected ? "border-sky-300 bg-sky-300 text-slate-950" : "border-white/15"}`}>
                      {habit.selected && <Check size={13} />}
                    </span>
                    {habit.nameAr}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="field-input" value={customHabit} onChange={(e) => setCustomHabit(e.target.value)} placeholder="عادة مخصصة..." />
                <button type="button" onClick={() => { if (!customHabit.trim()) return; setHabits((current) => [...current, { name: customHabit.trim(), nameAr: customHabit.trim(), selected: true }]); setCustomHabit(""); }} className="rounded-lg bg-sky-400 px-4 text-slate-950 hover:bg-sky-300">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}

          {error && <div className="mt-5 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        </section>

        <footer className="mt-5 flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => { setError(""); setStep((current) => current - 1); }} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.04]">
              <ChevronRight size={16} />
              رجوع
            </button>
          )}
          <button type="button" onClick={next} disabled={loading} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600">
            {loading ? "جاري الحفظ..." : step < steps.length - 1 ? (
              <>
                التالي
                <ChevronLeft size={16} />
              </>
            ) : (
              <>
                <Sparkles size={16} />
                ابدأ رحلتك
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}

function StepTitle({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-400">{text}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function ChoiceGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | [string, string]>;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold text-slate-300">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const optionValue = Array.isArray(option) ? option[0] : option;
          const optionLabel = Array.isArray(option) ? option[1] : option;
          return (
            <button
              type="button"
              key={optionValue}
              onClick={() => onChange(optionValue)}
              className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${value === optionValue ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 text-slate-400 hover:bg-white/[0.04]"}`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-black text-sky-300 hover:bg-sky-400/15">
      <Plus size={16} />
      {children}
    </button>
  );
}

function List({ items, onDelete }: { items: string[]; onDelete: (index: number) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          <span className="truncate">{item}</span>
          <button type="button" onClick={() => onDelete(index)} className="rounded-md p-1 text-red-300/70 hover:bg-red-400/10 hover:text-red-300">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
