import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Calendar, Check, GraduationCap, Plus, Trash2, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { LegacySubject } from "../types";
import {
  dailyLectureLoad,
  daysUntilExam,
  difficultyColors,
  difficultyLabels,
  nextCompletedLectures,
  normalizeDifficulty,
  remainingLectures,
  studyRisk,
  subjectProgress,
  todayIso,
} from "../lib/modules/study";

function SubjectForm({
  onSave,
  onCancel,
}: {
  onSave: (subject: Omit<LegacySubject, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState(todayIso());
  const [totalLectures, setTotalLectures] = useState("5");
  const [difficulty, setDifficulty] = useState(3);
  const [error, setError] = useState("");

  const submit = () => {
    const total = Number(totalLectures);
    if (!name.trim()) {
      setError("اكتب اسم المادة الأول.");
      return;
    }
    if (!examDate) {
      setError("اختار تاريخ الامتحان.");
      return;
    }
    if (!Number.isFinite(total) || total < 1) {
      setError("عدد المحاضرات لازم يكون رقم أكبر من صفر.");
      return;
    }

    onSave({
      name: name.trim(),
      examDate,
      difficulty,
      totalLectures: total,
      completedLectures: 0,
      color: difficultyColors[difficulty],
    });
  };

  return (
    <div className="glass-card mb-5 p-5">
      <div className="mb-4">
        <label className="mb-2 block text-xs font-bold text-slate-400">اسم المادة</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: Internet Programming" className="field-input" autoFocus />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-400">تاريخ الامتحان</label>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-400">عدد المحاضرات</label>
          <input type="number" min={1} value={totalLectures} onChange={(e) => setTotalLectures(e.target.value)} className="field-input" />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-xs font-bold text-slate-400">الصعوبة</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              type="button"
              key={level}
              onClick={() => setDifficulty(level)}
              className="rounded-lg border px-3 py-2 text-xs font-bold transition"
              style={{
                borderColor: difficulty === level ? difficultyColors[level] : "rgba(255,255,255,0.10)",
                color: difficulty === level ? difficultyColors[level] : "#94a3b8",
                background: difficulty === level ? `${difficultyColors[level]}18` : "rgba(255,255,255,0.02)",
              }}
            >
              {difficultyLabels[level]}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</div>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 hover:bg-white/[0.04]">
          إلغاء
        </button>
        <button type="button" onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-black text-white hover:bg-violet-400">
          <Plus size={16} />
          إضافة
        </button>
      </div>
    </div>
  );
}

export default function StudyScreen({ onBack }: { onBack: () => void }) {
  const { state, addSubject, updateSubject, deleteSubject } = useApp();
  const [showForm, setShowForm] = useState(false);

  const subjects = useMemo(() => state.subjects ?? [], [state.subjects]);

  const completeLecture = (subject: LegacySubject) => {
    updateSubject(subject.id, { completedLectures: nextCompletedLectures(subject, 1) });
  };

  const undoLecture = (subject: LegacySubject) => {
    updateSubject(subject.id, { completedLectures: nextCompletedLectures(subject, -1) });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-slate-100">
      <header className="glass-panel sticky top-0 z-20 flex items-center justify-between border-b border-white/10 px-5 py-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]">
          <ArrowLeft size={17} />
          الرئيسية
        </button>
        <div className="flex items-center gap-3">
          <GraduationCap size={22} className="text-violet-300" />
          <h1 className="text-xl font-black">الدراسة</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-400">{subjects.length} مادة</div>
            <p className="mt-1 text-xs text-slate-500">تابع المواد، المحاضرات، وضغط الامتحانات.</p>
          </div>
          <button type="button" onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-sm font-black text-violet-300 hover:bg-violet-400/15">
            <Plus size={17} />
            مادة جديدة
          </button>
        </div>

        {showForm && <SubjectForm onSave={(subject) => { addSubject(subject); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

        {subjects.length === 0 ? (
          <div className="glass-card grid min-h-[260px] place-items-center p-8 text-center">
            <div>
              <GraduationCap className="mx-auto mb-4 text-violet-300" size={42} />
              <h2 className="text-xl font-black">لسه مفيش مواد</h2>
              <p className="mt-2 text-sm text-slate-400">اضغط "مادة جديدة" وابدأ بخطة امتحانات واضحة.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {subjects.map((subject) => {
              const total = subject.totalLectures ?? 0;
              const completed = subject.completedLectures ?? 0;
              const progress = subjectProgress(subject);
              const days = daysUntilExam(subject.examDate);
              const remaining = remainingLectures(subject);
              const dailyLoad = dailyLectureLoad(subject);
              const difficulty = normalizeDifficulty(subject.difficulty);
              const risk = studyRisk(subject);

              return (
                <article key={subject.id} className="glass-card p-5" style={{ borderRight: `4px solid ${difficultyColors[difficulty]}` }}>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black">{subject.name}</h2>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="rounded-md px-2 py-1" style={{ color: difficultyColors[difficulty], background: `${difficultyColors[difficulty]}14` }}>
                          {difficultyLabels[difficulty]}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1">
                          <Calendar size={13} />
                          {subject.examDate || "بدون تاريخ"}
                        </span>
                        {risk !== "safe" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-400/10 px-2 py-1 text-red-300">
                            <AlertTriangle size={13} />
                            ضغط عالي
                          </span>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => deleteSubject(subject.id)} className="rounded-lg p-2 text-red-300/70 hover:bg-red-400/10 hover:text-red-300" aria-label="حذف المادة">
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="w-12 text-left font-mono text-sm font-black text-violet-300">{progress}%</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-slate-400">
                      {completed}/{total} محاضرة · {days} يوم · {dailyLoad} محاضرة/يوم
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => undoLecture(subject)} disabled={completed <= 0} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40">
                        -1
                      </button>
                      <button type="button" onClick={() => completeLecture(subject)} disabled={completed >= total} className="inline-flex items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-2 text-sm font-black text-violet-300 hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-40">
                        <TrendingUp size={15} />
                        +1
                      </button>
                      {completed >= total && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300">
                          <Check size={15} />
                          مكتملة
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
