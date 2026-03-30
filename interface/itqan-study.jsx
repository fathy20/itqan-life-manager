import { useState } from "react";
import {
  GraduationCap, AlertTriangle, Clock, Target, CheckCircle2,
  BookOpen, BarChart3, TrendingUp, Flame, Plus, ChevronRight,
  Calendar, Zap, Star, Award, Brain
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";

const SUBJECTS = [
  { name: "Physics", nameAr: "الفيزياء", examDate: "Apr 4", daysLeft: 5, totalLectures: 42, completed: 28, difficulty: 4, risk: "danger", color: "#F87171" },
  { name: "Data Structures", nameAr: "هياكل البيانات", examDate: "Apr 14", daysLeft: 15, totalLectures: 36, completed: 20, difficulty: 3, risk: "warning", color: "#FBBF24" },
  { name: "Calculus III", nameAr: "التفاضل والتكامل", examDate: "Apr 20", daysLeft: 21, totalLectures: 30, completed: 24, difficulty: 3, risk: "safe", color: "#34D399" },
  { name: "Software Eng", nameAr: "هندسة البرمجيات", examDate: "Apr 22", daysLeft: 23, totalLectures: 28, completed: 22, difficulty: 2, risk: "safe", color: "#34D399" },
  { name: "Database Systems", nameAr: "قواعد البيانات", examDate: "Apr 25", daysLeft: 26, totalLectures: 32, completed: 18, difficulty: 3, risk: "warning", color: "#FBBF24" },
];

const STUDY_WEEK = [
  { day: "سبت", hours: 4 }, { day: "أحد", hours: 3 }, { day: "اثنين", hours: 5 },
  { day: "ثلاثاء", hours: 2 }, { day: "أربعاء", hours: 4.5 }, { day: "خميس", hours: 3 }, { day: "جمعة", hours: 1 },
];

function Card({ children, style, glow }) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", position: "relative", overflow: "hidden", ...style }}>
      {glow && <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: glow, opacity: 0.04, filter: "blur(30px)", pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function BarTip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, color: "#60A5FA" }}>{payload[0].value}h</div>
    </div>
  );
}

export default function StudySystem() {
  const nextExam = SUBJECTS.reduce((a, b) => a.daysLeft < b.daysLeft ? a : b);
  const dangerCount = SUBJECTS.filter(s => s.risk === "danger").length;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, opacity: 0, animation: "fi 0.4s ease forwards" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <GraduationCap size={20} color="#60A5FA" />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>الدراسة</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Study System</span>
          </div>
          <div style={{ fontSize: 12, color: MUTED }}>Exam war room and subject tracking</div>
        </div>
        <button style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "#60A5FA10", border: "1px solid #60A5FA25", color: "#60A5FA", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={13} /> Add subject
        </button>
      </div>

      {/* War Room */}
      <Card glow="#F87171" style={{ marginBottom: 16, borderColor: `${nextExam.color}25` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <AlertTriangle size={16} color="#F87171" />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#F87171" }}>War Room — Next Exam</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
          <div style={{ padding: "14px", borderRadius: 10, background: BG, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: mono, color: "#F87171" }}>{nextExam.daysLeft}</div>
            <div style={{ fontSize: 10, color: MUTED }}>days left</div>
          </div>
          <div style={{ padding: "14px", borderRadius: 10, background: BG, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: mono, color: BRIGHT }}>{nextExam.name}</div>
            <div style={{ fontSize: 10, color: MUTED }}>{nextExam.examDate}</div>
          </div>
          <div style={{ padding: "14px", borderRadius: 10, background: BG, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: mono, color: "#FBBF24" }}>
              {nextExam.totalLectures - nextExam.completed}
            </div>
            <div style={{ fontSize: 10, color: MUTED }}>lectures remaining</div>
          </div>
          <div style={{ padding: "14px", borderRadius: 10, background: BG, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: mono, color: "#FB923C" }}>
              {Math.ceil((nextExam.totalLectures - nextExam.completed) / nextExam.daysLeft)}
            </div>
            <div style={{ fontSize: 10, color: MUTED }}>lectures/day needed</div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        {/* Subjects */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={14} color="#60A5FA" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Subjects</span>
            </div>
            {dangerCount > 0 && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "#F8717112", color: "#F87171" }}>{dangerCount} at risk</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SUBJECTS.map((sub, i) => {
              const pct = Math.round((sub.completed / sub.totalLectures) * 100);
              const dailyNeeded = Math.ceil((sub.totalLectures - sub.completed) / sub.daysLeft);
              return (
                <div key={sub.name} style={{
                  padding: "14px 16px", borderRadius: 10, background: BG, border: `1px solid ${BORDER}`,
                  opacity: 0, animation: `fi 0.3s ease ${i * 0.06}s forwards`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: BRIGHT }}>{sub.name}</span>
                      <span style={{ fontSize: 11, fontFamily: ar, color: MUTED }}>{sub.nameAr}</span>
                    </div>
                    <span style={{
                      fontSize: 9, padding: "2px 8px", borderRadius: 6,
                      background: `${sub.color}12`, color: sub.color,
                      border: `1px solid ${sub.color}20`,
                    }}>{sub.risk}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#0C2550", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: sub.color }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: mono, color: TEXT }}>{pct}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: MUTED }}>
                    <span>Exam: <span style={{ fontFamily: mono, color: TEXT }}>{sub.examDate}</span></span>
                    <span>Left: <span style={{ fontFamily: mono, color: "#FBBF24" }}>{sub.totalLectures - sub.completed}</span> lectures</span>
                    <span>Daily: <span style={{ fontFamily: mono, color: dailyNeeded > 3 ? "#F87171" : "#34D399" }}>{dailyNeeded}/day</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <BarChart3 size={14} color="#60A5FA" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Study hours this week</span>
              <span style={{ fontSize: 11, fontFamily: mono, color: "#60A5FA", marginLeft: "auto" }}>
                {STUDY_WEEK.reduce((a, b) => a + b.hours, 0)}h total
              </span>
            </div>
            <div style={{ height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={STUDY_WEEK}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: ar }} />
                  <Tooltip content={<BarTip />} cursor={false} />
                  <Bar dataKey="hours" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card glow={CYAN}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Brain size={14} color={CYAN} />
              <span style={{ fontSize: 13, fontWeight: 600, color: CYAN }}>AI study strategy</span>
            </div>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
              Physics is critical — 5 days, 14 lectures. Do 3 lectures today (morning focus slot). Shift Data Structures to Thursday. Calculus is on track — reduce to maintenance mode.
            </p>
            <button style={{ marginTop: 10, padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer", background: `${CYAN}10`, border: `1px solid ${CYAN}25`, color: CYAN }}>
              Generate full study plan
            </button>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={14} color="#60A5FA" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Study score</span>
              </div>
              <span style={{ fontSize: 14, fontFamily: mono, fontWeight: 700, color: "#60A5FA" }}>12/15</span>
            </div>
            <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
              2 study tasks completed today (+7 pts), 1 focus session (+3 pts), Physics priority bonus (+2 pts).
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
