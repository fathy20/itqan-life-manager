import { useState } from "react";
import {
  Briefcase, CheckCircle2, Circle, Plus, Clock, Target,
  Layers, TrendingUp, Award, BarChart3, ChevronRight,
  Zap, Star, AlertTriangle, Filter
} from "lucide-react";

const mono = "'JetBrains Mono', monospace"; const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";

const TASKS = [
  { id: 1, title: "FlightAssist — API integration", type: "freelance", focus: "deep", done: true, deadline: "Today" },
  { id: 2, title: "Fix login bug — FlightAssist", type: "freelance", focus: "medium", done: true, deadline: "Today" },
  { id: 3, title: "Prepare sprint demo slides", type: "job", focus: "light", done: false, deadline: "Tomorrow" },
  { id: 4, title: "Review PR #47 — backend auth", type: "job", focus: "medium", done: false, deadline: "Tomorrow" },
  { id: 5, title: "Write unit tests — finance module", type: "freelance", focus: "deep", done: false, deadline: "Wed" },
  { id: 6, title: "Update Itqan README", type: "personal", focus: "light", done: false, deadline: "This week" },
];

const PROJECTS = [
  { name: "FlightAssist", client: "EgyptAir", progress: 72, status: "active", deadline: "Apr 8", color: "#FB923C" },
  { name: "Itqan Life OS", client: "Personal", progress: 45, status: "active", deadline: "Ongoing", color: CYAN },
];

const COURSES = [
  { name: "React Advanced Patterns", platform: "Frontend Masters", progress: 68, lessons: "24/35" },
  { name: "System Design", platform: "Educative", progress: 40, lessons: "12/30" },
  { name: "Docker & K8s", platform: "Udemy", progress: 15, lessons: "5/32" },
];

const typeC = { freelance: "#34D399", job: "#60A5FA", personal: "#A78BFA" };
const focusC = { deep: "#F87171", medium: "#FBBF24", light: "#34D399" };

function Card({ children, style }) {
  return <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", ...style }}>{children}</div>;
}

export default function WorkSystem() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? TASKS : TASKS.filter(t => t.type === filter);
  const doneCount = TASKS.filter(t => t.done).length;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } } * { box-sizing:border-box; margin:0; padding:0; }`}</style>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, opacity: 0, animation: "fi 0.4s ease forwards" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Briefcase size={20} color="#FB923C" />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>العمل</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Work System</span>
          </div>
        </div>
        <button style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "#FB923C10", border: "1px solid #FB923C25", color: "#FB923C", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={13} /> Add task
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        {/* Tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={14} color="#FB923C" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Tasks</span>
                <span style={{ fontSize: 11, fontFamily: mono, color: "#34D399" }}>{doneCount}/{TASKS.length}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["all", "freelance", "job", "personal"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 10, cursor: "pointer",
                    background: filter === f ? `${typeC[f] || CYAN}10` : "transparent",
                    border: `1px solid ${filter === f ? `${typeC[f] || CYAN}25` : BORDER}`,
                    color: filter === f ? (typeC[f] || CYAN) : MUTED, textTransform: "capitalize",
                  }}>{f}</button>
                ))}
              </div>
            </div>
            {filtered.map((t, i) => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, marginBottom: 6,
                opacity: 0, animation: `fi 0.3s ease ${i * 0.05}s forwards`,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4, cursor: "pointer", flexShrink: 0,
                  background: t.done ? "#A78BFA" : "transparent",
                  border: t.done ? "none" : `1.5px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{t.done && <CheckCircle2 size={11} color="#000E30" />}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, color: t.done ? MUTED : TEXT, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
                </div>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${focusC[t.focus]}10`, color: focusC[t.focus] }}>{t.focus}</span>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${typeC[t.type]}10`, color: typeC[t.type] }}>{t.type}</span>
                <span style={{ fontSize: 10, fontFamily: mono, color: MUTED }}>{t.deadline}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Projects + Courses */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Layers size={14} color="#FB923C" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Active projects</span>
            </div>
            {PROJECTS.map(p => (
              <div key={p.name} style={{ padding: "12px 14px", borderRadius: 10, background: BG, border: `1px solid ${BORDER}`, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: BRIGHT }}>{p.name}</span>
                  <span style={{ fontSize: 10, color: MUTED }}>{p.client}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#0C2550", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.progress}%`, borderRadius: 2, background: p.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: mono, color: p.color }}>{p.progress}%</span>
                </div>
                <span style={{ fontSize: 10, color: MUTED }}>Deadline: {p.deadline}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Star size={14} color="#A78BFA" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Learning courses</span>
            </div>
            {COURSES.map(c => (
              <div key={c.name} style={{ padding: "10px 14px", borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: TEXT }}>{c.name}</span>
                  <span style={{ fontSize: 10, color: MUTED }}>{c.platform}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#0C2550", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${c.progress}%`, borderRadius: 2, background: "#A78BFA" }} />
                  </div>
                  <span style={{ fontSize: 10, fontFamily: mono, color: MUTED }}>{c.lessons}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
