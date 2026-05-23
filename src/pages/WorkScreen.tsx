import { useState } from "react";
import type { ElementType, ReactNode } from "react";
import { ArrowLeft, BookOpen, Briefcase, Check, Clock, FolderOpen, Plus, Target, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { LegacyCourse, LegacyProject, LegacyTask } from "../types";
import {
  courseProgress,
  courseTotals,
  isTaskDone,
  nextCompletedLessons,
  nextProjectProgress,
  splitTasks,
  typeColors,
  typeLabels,
} from "../lib/modules/work";

const tabs = [
  { id: "tasks", label: "المهام", icon: Target },
  { id: "projects", label: "المشاريع", icon: FolderOpen },
  { id: "courses", label: "الكورسات", icon: BookOpen },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function TaskForm({ onSave, onCancel }: { onSave: (task: Omit<LegacyTask, "id">) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("work");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("60");
  const [error, setError] = useState("");

  const submit = () => {
    if (!title.trim()) {
      setError("اكتب عنوان المهمة.");
      return;
    }
    onSave({
      title: title.trim(),
      type,
      status: "todo",
      priority: "medium",
      completed: false,
      focusLevel: "medium",
      estimatedMinutes: Number(estimatedMinutes) || 60,
      deadline: deadline || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="glass-card mb-5 p-5">
      <div className="mb-4">
        <Field label="عنوان المهمة">
          <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مراجعة API المشروع" autoFocus />
        </Field>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Field label="النوع">
          <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <Field label="المدة المتوقعة بالدقايق">
          <input className="field-input" type="number" min={1} value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} />
        </Field>
      </div>
      <div className="mb-4">
        <Field label="الموعد">
          <input className="field-input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</div>}
      <FormActions onCancel={onCancel} onSubmit={submit} submitLabel="إضافة مهمة" />
    </div>
  );
}

function ProjectForm({ onSave, onCancel }: { onSave: (project: Omit<LegacyProject, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) {
      setError("اكتب اسم المشروع.");
      return;
    }
    onSave({
      name: name.trim(),
      client: client.trim() || undefined,
      deadline: deadline || undefined,
      progress: 0,
      status: "active",
      color: "#f97316",
    });
  };

  return (
    <div className="glass-card mb-5 p-5">
      <div className="mb-4">
        <Field label="اسم المشروع">
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: FlightAssist" autoFocus />
        </Field>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Field label="العميل أو الجهة">
          <input className="field-input" value={client} onChange={(e) => setClient(e.target.value)} placeholder="اختياري" />
        </Field>
        <Field label="الموعد النهائي">
          <input className="field-input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</div>}
      <FormActions onCancel={onCancel} onSubmit={submit} submitLabel="إضافة مشروع" />
    </div>
  );
}

function CourseForm({ onSave, onCancel }: { onSave: (course: Omit<LegacyCourse, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [totalLessons, setTotalLessons] = useState("20");
  const [error, setError] = useState("");

  const submit = () => {
    const total = Number(totalLessons);
    if (!name.trim()) {
      setError("اكتب اسم الكورس.");
      return;
    }
    if (!Number.isFinite(total) || total < 1) {
      setError("عدد الدروس لازم يكون أكبر من صفر.");
      return;
    }
    onSave({
      name: name.trim(),
      platform: platform.trim() || "Self-study",
      totalLessons: total,
      completedLessons: 0,
      progress: 0,
      status: "active",
      color: "#8b5cf6",
    });
  };

  return (
    <div className="glass-card mb-5 p-5">
      <div className="mb-4">
        <Field label="اسم الكورس">
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: React Advanced" autoFocus />
        </Field>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Field label="المنصة">
          <input className="field-input" value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="Udemy / YouTube / Self-study" />
        </Field>
        <Field label="عدد الدروس">
          <input className="field-input" type="number" min={1} value={totalLessons} onChange={(e) => setTotalLessons(e.target.value)} />
        </Field>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</div>}
      <FormActions onCancel={onCancel} onSubmit={submit} submitLabel="إضافة كورس" />
    </div>
  );
}

function FormActions({ onCancel, onSubmit, submitLabel }: { onCancel: () => void; onSubmit: () => void; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 hover:bg-white/[0.04]">
        إلغاء
      </button>
      <button type="button" onClick={onSubmit} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-black text-white hover:bg-orange-400">
        <Plus size={16} />
        {submitLabel}
      </button>
    </div>
  );
}

export default function WorkScreen({ onBack }: { onBack: () => void }) {
  const {
    state,
    addTask,
    updateTask,
    deleteTask,
    addProject,
    updateProject,
    deleteProject,
    addCourse,
    updateCourse,
    deleteCourse,
  } = useApp();
  const [tab, setTab] = useState<TabId>("tasks");
  const [showForm, setShowForm] = useState(false);

  const { pending: pendingTasks, done: doneTasks } = splitTasks(state.tasks);

  const switchTab = (next: TabId) => {
    setTab(next);
    setShowForm(false);
  };

  const toggleTask = (task: LegacyTask) => {
    const isDone = isTaskDone(task);
    updateTask(task.id, {
      completed: !isDone,
      status: isDone ? "todo" : "completed",
      updatedAt: new Date().toISOString(),
    });
  };

  const addButtonLabel = tab === "tasks" ? "مهمة جديدة" : tab === "projects" ? "مشروع جديد" : "كورس جديد";

  return (
    <div dir="rtl" className="min-h-screen bg-background text-slate-100">
      <header className="glass-panel sticky top-0 z-20 flex items-center justify-between border-b border-white/10 px-5 py-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]">
          <ArrowLeft size={17} />
          الرئيسية
        </button>
        <div className="flex items-center gap-3">
          <Briefcase size={22} className="text-orange-300" />
          <h1 className="text-xl font-black">نظام العمل</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {tabs.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => switchTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-black transition ${
                  tab === item.id ? "border-orange-400/30 bg-orange-400/10 text-orange-300" : "border-white/10 text-slate-400 hover:bg-white/[0.04]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-black text-orange-300 hover:bg-orange-400/15">
            <Plus size={17} />
            {addButtonLabel}
          </button>
        </div>

        {showForm && tab === "tasks" && <TaskForm onSave={(task) => { addTask(task); setShowForm(false); }} onCancel={() => setShowForm(false)} />}
        {showForm && tab === "projects" && <ProjectForm onSave={(project) => { addProject(project); setShowForm(false); }} onCancel={() => setShowForm(false)} />}
        {showForm && tab === "courses" && <CourseForm onSave={(course) => { addCourse(course); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

        {tab === "tasks" && (
          <section className="space-y-6">
            <div>
              <h2 className="mb-3 text-sm font-black text-slate-400">{pendingTasks.length} مهمة نشطة</h2>
              {pendingTasks.length === 0 ? (
                <EmptyState title="مفيش مهام نشطة" text="ضيف مهمة جديدة عشان تبدأ تنظيم شغلك." icon={Target} />
              ) : (
                <div className="grid gap-3">
                  {pendingTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task)} onDelete={() => deleteTask(task.id)} />
                  ))}
                </div>
              )}
            </div>

            {doneTasks.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-black text-slate-500">مكتملة ({doneTasks.length})</h2>
                <div className="grid gap-2 opacity-70">
                  {doneTasks.slice(0, 8).map((task) => (
                    <TaskCard key={task.id} task={task} done onToggle={() => toggleTask(task)} onDelete={() => deleteTask(task.id)} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "projects" && (
          <section className="grid gap-3">
            {state.projects.length === 0 ? (
              <EmptyState title="لسه مفيش مشاريع" text="ضيف مشروع وتابع تقدمه من هنا." icon={FolderOpen} />
            ) : (
              state.projects.map((project) => {
                const progress = nextProjectProgress(project.progress ?? 0, 0);
                return (
                  <article key={project.id} className="glass-card p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-black">{project.name}</h2>
                        <p className="mt-1 text-sm text-slate-400">{project.client || "بدون عميل"} {project.deadline ? `· ${project.deadline}` : ""}</p>
                      </div>
                      <button type="button" onClick={() => deleteProject(project.id)} className="rounded-lg p-2 text-red-300/70 hover:bg-red-400/10">
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <Progress value={progress} color="#fb923c" />
                    <div className="mt-4 flex flex-wrap justify-between gap-2">
                      <div className="text-sm text-slate-400">التقدم: {progress}%</div>
                      <div className="flex gap-2">
                        <SmallButton onClick={() => updateProject(project.id, { progress: nextProjectProgress(progress, -10) })}>-10%</SmallButton>
                        <SmallButton onClick={() => {
                          const nextProgress = nextProjectProgress(progress, 10);
                          updateProject(project.id, { progress: nextProgress, status: nextProgress >= 100 ? "completed" : project.status });
                        }}>+10%</SmallButton>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}

        {tab === "courses" && (
          <section className="grid gap-3">
            {state.courses.length === 0 ? (
              <EmptyState title="لسه مفيش كورسات" text="ضيف كورس وتابع عدد الدروس المكتملة." icon={BookOpen} />
            ) : (
              state.courses.map((course) => {
                const { total, completed } = courseTotals(course);
                const progress = courseProgress(course);
                return (
                  <article key={course.id} className="glass-card p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-black">{course.name}</h2>
                        <p className="mt-1 text-sm text-slate-400">{course.platform || "Self-study"}</p>
                      </div>
                      <button type="button" onClick={() => deleteCourse(course.id)} className="rounded-lg p-2 text-red-300/70 hover:bg-red-400/10">
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <Progress value={progress} color="#a78bfa" />
                    <div className="mt-4 flex flex-wrap justify-between gap-2">
                      <div className="text-sm text-slate-400">{completed}/{total} درس · {progress}%</div>
                      <div className="flex gap-2">
                        <SmallButton onClick={() => {
                          const nextCompleted = nextCompletedLessons(course, -1);
                          updateCourse(course.id, { completedLessons: nextCompleted, progress: courseProgress({ ...course, completedLessons: nextCompleted }) });
                        }}>-1</SmallButton>
                        <SmallButton onClick={() => {
                          const nextCompleted = nextCompletedLessons(course, 1);
                          updateCourse(course.id, { completedLessons: nextCompleted, progress: courseProgress({ ...course, completedLessons: nextCompleted }) });
                        }}>+1 درس</SmallButton>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function TaskCard({ task, done, onToggle, onDelete }: { task: LegacyTask; done?: boolean; onToggle: () => void; onDelete: () => void }) {
  const color = typeColors[task.type] || "#94a3b8";
  return (
    <article className="glass-card flex items-center gap-3 p-4" style={{ borderRight: `4px solid ${color}` }}>
      <button type="button" onClick={onToggle} className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${done ? "border-emerald-400 bg-emerald-400/10" : "border-white/15"}`}>
        {done && <Check size={15} className="text-emerald-300" />}
      </button>
      <div className="min-w-0 flex-1">
        <h3 className={`truncate text-sm font-black ${done ? "text-slate-500 line-through" : "text-slate-100"}`}>{task.title}</h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-md px-2 py-1" style={{ color, background: `${color}14` }}>{typeLabels[task.type] || task.type}</span>
          {task.deadline && <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1"><Clock size={12} />{task.deadline}</span>}
        </div>
      </div>
      <button type="button" onClick={onDelete} className="rounded-lg p-2 text-red-300/70 hover:bg-red-400/10">
        <Trash2 size={16} />
      </button>
    </article>
  );
}

function EmptyState({ title, text, icon: Icon }: { title: string; text: string; icon: ElementType }) {
  return (
    <div className="glass-card grid min-h-[230px] place-items-center p-8 text-center">
      <div>
        <Icon className="mx-auto mb-4 text-orange-300" size={40} />
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function Progress({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}

function SmallButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/[0.04]">
      {children}
    </button>
  );
}
