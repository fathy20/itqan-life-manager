import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, ArrowLeft, Plus, BookOpen, Calendar, Trash2,
  TrendingUp, Layers
} from "lucide-react";
import { subjectsApiNew } from "../lib/api/index";
import type { Subject } from "../types/new";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#6366F1"; // Indigo for Study

const DIFFICULTY_COLORS = ["", "#10B981", "#34D399", "#FBBF24", "#FB923C", "#F87171"];
const DIFFICULTY_LABELS = ["", "سهل جداً", "سهل", "متوسط", "صعب", "صعب جداً"];

export default function StudyScreen({ onBack }: { onBack: () => void }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #4338CA)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <GraduationCap color="white" size={20} />
    </div>
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await subjectsApiNew.list();
    if (res.success && res.data) setSubjects(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const daysLeft = (examDate: string) => Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000));

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#F1F5F9", paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
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
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={18} /> الرئيسية
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>نظام الدراسة</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>ACADEMIC ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
           <h2 style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8" }}>المواد والمناهج</h2>
           <button style={{
             padding: "10px 20px", borderRadius: "12px", background: ACCENT, color: "white",
             border: "none", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
             boxShadow: `0 8px 20px ${ACCENT}40`
           }}><Plus size={18} /> مادة جديدة</button>
        </div>

        {loading ? <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>جاري جلب خطتك الدراسية...</div> : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {subjects.map((s, i) => {
              const progress = s.totalLectures > 0 ? Math.round((s.completedLectures / s.totalLectures) * 100) : 0;
              const days = daysLeft(s.examDate);
              return (
                <div key={s.id} className="glass-card" style={{ padding: 24, animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`, borderRight: `4px solid ${DIFFICULTY_COLORS[s.difficulty]}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "12px", background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen size={20} color={ACCENT} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                       <span style={{ fontSize: 10, color: "#64748B", display: "block" }}>DAYS UNTIL EXAM</span>
                       <span style={{ fontSize: 18, fontWeight: 900, color: days < 7 ? "#EF4444" : "#F1F5F9", fontFamily: "'JetBrains Mono', monospace" }}>{days}</span>
                    </div>
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{s.name}</h3>
                  <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                     <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: "6px", background: `${DIFFICULTY_COLORS[s.difficulty]}15`, color: DIFFICULTY_COLORS[s.difficulty], fontWeight: 700 }}>{DIFFICULTY_LABELS[s.difficulty]}</span>
                     <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", color: "#64748B" }}>{s.examDate}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: ACCENT, borderRadius: 10 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: ACCENT }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
