/**
 * WorkScreen — Tasks, Projects, Courses
 * Connected to: tasksApiNew, projectsApiNew, coursesApiNew
 */
import { useState, useEffect, useCallback } from "react";
import {
  Briefcase, Plus, Check, X, ChevronDown,
  Trash2, Edit3, FolderOpen, BookOpen, Layers,
  ArrowLeft, Clock, Target, TrendingUp,
} from "lucide-react";
import { tasksApiNew, projectsApiNew, coursesApiNew } from "../lib/api/index";
import type { Task, Project, Course } from "../types/new";

const BG = "#000E30";
const CARD = "#0A1628";
const BORDER = "#0F2847";
const TEXT = "#C0C8D8";
const MUTED = "#3D5A80";
const ACCENT = "#FB923C";

const TABS = [
  { id: "tasks", label: "المهام", icon: Target },
  { id: "projects", label: "المشاريع", icon: FolderOpen },
  { id: "courses", label: "الكورسات", icon: BookOpen },
] as const;

type TabId = typeof TABS[number]["id"];

const TYPE_COLORS: Record<string, string> = {
  job: "#3B82F6", freelance: "#10B981", study: "#8B5CF6",
  personal: "#F59E0B", worship: "#06B6D4", health: "#EC4899",
};

const TYPE_LABELS: Record<string, string> = {
  job: "وظيفة", freelance: "فريلانس", study: "دراسة",
  personal: "شخصي", worship: "عبادة", health: "صحة",
};

const FOCUS_LABELS: Record<string, string> = {
  deep: "عميق", medium: "متوسط", light: "خفيف",
};

// ── Task Form ────────────────────────────────────────────────
function TaskForm({ onSave, onCancel }: { onSave: (t: Partial<Task>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Task["type"]>("job");
  const [focusLevel, setFocusLevel] = useState<Task["focusLevel"]>("medium");
  const [deadline, setDeadline] = useState("");

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 16, animation: "fadeIn 0.3s" }}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان المهمة..."
        style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 16, color: TEXT, fontFamily: "'Noto Kufi Arabic', sans-serif", marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {(Object.keys(TYPE_LABELS) as Task["type"][]).map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: type === t ? TYPE_COLORS[t] + "20" : "transparent",
            border: `1px solid ${type === t ? TYPE_COLORS[t] : BORDER}`,
            color: type === t ? TYPE_COLORS[t] : MUTED,
            fontFamily: "'Noto Kufi Arabic', sans-serif",
          }}>{TYPE_LABELS[t]}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(["deep", "medium", "light"] as const).map(f => (
          <button key={f} onClick={() => setFocusLevel(f)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: focusLevel === f ? ACCENT + "20" : "transparent",
            border: `1px solid ${focusLevel === f ? ACCENT : BORDER}`,
            color: focusLevel === f ? ACCENT : MUTED,
          }}>{FOCUS_LABELS[f]}</button>
        ))}
      </div>
      <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
        style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px", color: MUTED, fontSize: 12, marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", fontSize: 13 }}>إلغاء</button>
        <button onClick={() => { if (title.trim()) onSave({ title, type, focusLevel, deadline: deadline || undefined, completed: false }); }}
          style={{ padding: "8px 20px", borderRadius: 8, background: ACCENT + "20", border: `1px solid ${ACCENT}40`, color: ACCENT, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>إضافة</button>
      </div>
    </div>
  );
}

// ── Main Screen ──────────────────────────────────────────────
export default function WorkScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<TabId>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [tRes, pRes, cRes] = await Promise.all([
      tasksApiNew.list(), projectsApiNew.list(), coursesApiNew.list(),
    ]);
    if (tRes.success && tRes.data) setTasks(tRes.data);
    if (pRes.success && pRes.data) setProjects(pRes.data);
    if (cRes.success && cRes.data) setCourses(cRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addTask = async (data: Partial<Task>) => {
    const res = await tasksApiNew.create(data);
    if (res.success && res.data) { setTasks(prev => [res.data!, ...prev]); setShowForm(false); }
  };

  const toggleTask = async (t: Task) => {
    const res = await tasksApiNew.update(t.id, { completed: !t.completed });
    if (res.success) setTasks(prev => prev.map(x => x.id === t.id ? { ...x, completed: !x.completed } : x));
  };

  const deleteTask = async (id: string) => {
    const res = await tasksApiNew.delete(id);
    if (res.success) setTasks(prev => prev.filter(x => x.id !== id));
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const doneTasks = tasks.filter(t => t.completed);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, background: BG, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, cursor: "pointer", background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, fontSize: 13, fontFamily: "inherit" }}>
          <ArrowLeft size={16} /> الرئيسية
        </button>
        <div style={{ flex: 1 }} />
        <Briefcase size={20} color={ACCENT} />
        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>العمل</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
              borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: tab === t.id ? ACCENT + "15" : CARD,
              border: `1px solid ${tab === t.id ? ACCENT + "40" : BORDER}`,
              color: tab === t.id ? ACCENT : MUTED,
              fontFamily: "'Noto Kufi Arabic', sans-serif", transition: "all 0.2s",
            }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Tasks Tab ── */}
        {tab === "tasks" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: MUTED }}>{pendingTasks.length} مهمة نشطة</span>
              <button onClick={() => setShowForm(!showForm)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                borderRadius: 10, background: ACCENT + "15", border: `1px solid ${ACCENT}30`,
                color: ACCENT, cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}><Plus size={16} /> مهمة جديدة</button>
            </div>

            {showForm && <TaskForm onSave={addTask} onCancel={() => setShowForm(false)} />}

            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: MUTED }}>جاري التحميل...</div>
            ) : (
              <>
                {pendingTasks.map(t => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                    background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 8,
                    borderRight: `3px solid ${TYPE_COLORS[t.type] || MUTED}`,
                    animation: "fadeIn 0.3s",
                  }}>
                    <button onClick={() => toggleTask(t)} style={{
                      width: 24, height: 24, borderRadius: 6, border: `2px solid ${BORDER}`,
                      background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{t.title}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: (TYPE_COLORS[t.type] || MUTED) + "15", color: TYPE_COLORS[t.type] || MUTED }}>{TYPE_LABELS[t.type] || t.type}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: ACCENT + "10", color: MUTED }}>{FOCUS_LABELS[t.focusLevel] || t.focusLevel}</span>
                        {t.deadline && <span style={{ fontSize: 10, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} />{t.deadline}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteTask(t.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#F8717140", padding: 4 }}><Trash2 size={14} /></button>
                  </div>
                ))}

                {doneTasks.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>✅ مكتملة ({doneTasks.length})</div>
                    {doneTasks.slice(0, 5).map(t => (
                      <div key={t.id} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 6, opacity: 0.5,
                      }}>
                        <button onClick={() => toggleTask(t)} style={{
                          width: 24, height: 24, borderRadius: 6, background: "#10B98120",
                          border: `2px solid #10B981`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}><Check size={12} color="#10B981" /></button>
                        <span style={{ fontSize: 13, textDecoration: "line-through", color: MUTED }}>{t.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Projects Tab ── */}
        {tab === "projects" && (
          <div>
            {loading ? <div style={{ textAlign: "center", padding: 60, color: MUTED }}>جاري التحميل...</div> : (
              projects.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: MUTED, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>لا توجد مشاريع بعد</div>
              ) : projects.map(p => (
                <div key={p.id} style={{
                  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 12,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{p.name}</span>
                    <span style={{
                      fontSize: 10, padding: "3px 10px", borderRadius: 20,
                      background: p.status === "active" ? "#10B98115" : p.status === "paused" ? "#F59E0B15" : "#3B82F615",
                      color: p.status === "active" ? "#10B981" : p.status === "paused" ? "#F59E0B" : "#3B82F6",
                    }}>{p.status === "active" ? "نشط" : p.status === "paused" ? "متوقف" : "مكتمل"}</span>
                  </div>
                  {p.client && <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>العميل: {p.client}</div>}
                  <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.progress}%`, background: ACCENT, borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 6, textAlign: "left" }}>{p.progress}%</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Courses Tab ── */}
        {tab === "courses" && (
          <div>
            {loading ? <div style={{ textAlign: "center", padding: 60, color: MUTED }}>جاري التحميل...</div> : (
              courses.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: MUTED, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>لا توجد كورسات بعد</div>
              ) : courses.map(c => (
                <div key={c.id} style={{
                  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 12,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{c.name}</span>
                    <span style={{ fontSize: 10, color: MUTED }}>{c.platform}</span>
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{c.completedLessons}/{c.totalLessons} درس</div>
                  <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${c.progress}%`, background: "#8B5CF6", borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
