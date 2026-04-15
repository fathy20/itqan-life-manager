import { useState, useEffect, useCallback } from "react";
import {
  Briefcase, Plus, Check, Trash2, FolderOpen, BookOpen, 
  ArrowLeft, Clock, Target, ChevronRight, Zap, Layers
} from "lucide-react";
import { tasksApiNew, projectsApiNew, coursesApiNew } from "../lib/api/index";
import type { Task, Project, Course } from "../types/new";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#F97316"; // Brand color for Work

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

export default function WorkScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<TabId>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Logo Component
  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #C2410C)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Briefcase color="white" size={20} />
    </div>
  );

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

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#F1F5F9", paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700;900&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .glass-card { background: ${CARD_BG}; backdrop-filter: blur(12px); border: 1px solid ${BORDER_COLOR}; border-radius: 24px; }
      `}</style>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px", borderBottom: `1px solid ${BORDER_COLOR}`, background: "rgba(2, 6, 23, 0.8)",
        backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", color: "#94A3B8", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600
          }}>
            <ArrowLeft size={18} /> الرئيسية
          </button>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>نظام العمل</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>WORK ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", animation: "fadeInUp 0.6s ease-out" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px", borderRadius: "16px", cursor: "pointer", fontSize: "14px", fontWeight: 700,
              background: tab === t.id ? `${ACCENT}15` : CARD_BG,
              border: `1px solid ${tab === t.id ? ACCENT : BORDER_COLOR}`,
              color: tab === t.id ? ACCENT : "#94A3B8",
              fontFamily: "'Noto Kufi Arabic', sans-serif", transition: "all 0.3s"
            }}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>

        {/* Tasks Section */}
        {tab === "tasks" && (
          <div style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
               <h2 style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8" }}>المهام الجارية</h2>
               <button onClick={() => setShowForm(!showForm)} style={{
                 padding: "10px 20px", borderRadius: "12px", background: ACCENT, color: "white",
                 border: "none", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
                 boxShadow: `0 8px 20px ${ACCENT}40`
               }}><Plus size={18} /> مهمة جديدة</button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>جاري مراجعة مهامك...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tasks.filter(t => !t.completed).map((t, i) => (
                  <div key={t.id} className="glass-card" style={{
                    padding: "20px", display: "flex", alignItems: "center", gap: 16,
                    borderRight: `4px solid ${TYPE_COLORS[t.type] || ACCENT}`,
                    animation: `fadeInUp 0.5s ease-out ${i * 0.05}s both`
                  }}>
                    <button onClick={() => toggleTask(t)} style={{
                      width: 28, height: 28, borderRadius: "8px", border: "2px solid #334155",
                      background: "none", cursor: "pointer", transition: "all 0.2s"
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{t.title}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                         <span style={{ fontSize: 10, color: TYPE_COLORS[t.type], fontWeight: 700, background: `${TYPE_COLORS[t.type]}10`, padding: "2px 8px", borderRadius: "6px" }}>{TYPE_LABELS[t.type]}</span>
                         <span style={{ fontSize: 10, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12}/> {t.deadline || 'بدون موعد'}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteTask(t.id)} style={{ padding: 8, color: "#EF444430", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Section */}
        {tab === "projects" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {projects.map((p, i) => (
              <div key={p.id} className="glass-card" style={{ padding: 24, animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#3B82F615", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Layers size={20} color="#3B82F6" />
                  </div>
                  <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: "20px", background: "#10B98115", color: "#10B981", fontWeight: 700 }}>{p.status}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>{p.client || 'مشروع داخلي'}</p>
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ width: `${p.progress}%`, height: "100%", background: "linear-gradient(90deg, #3B82F6, #60A5FA)", borderRadius: 10 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, fontWeight: 700, color: "#3B82F6" }}>
                  <span>Progress</span>
                  <span>{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Section */}
        {tab === "courses" && (
           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             {courses.map((c, i) => (
               <div key={c.id} className="glass-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 20, animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                 <div style={{ width: 60, height: 60, borderRadius: "16px", background: "#8B5CF615", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen size={28} color="#8B5CF6" />
                 </div>
                 <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{c.name}</h3>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{c.platform} · {c.completedLessons}/{c.totalLessons} درس</p>
                 </div>
                 <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#8B5CF6" }}>{c.progress}%</div>
                    <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase" }}>Complete</div>
                 </div>
                 <ChevronRight color="#334155" size={20} />
               </div>
             ))}
           </div>
        )}

      </div>
    </div>
  );
}
