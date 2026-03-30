import { useState } from "react";
import {
  Calendar, ChevronLeft, ChevronRight, Moon, BookOpen, Star,
  GraduationCap, Briefcase, Clock, Sunrise, Target, CheckCircle2,
  AlertTriangle, Flame, Heart
} from "lucide-react";

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";

const DAYS_AR = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const EVENTS = {
  5: [{ title: "Physics exam", type: "exam", color: "#F87171" }],
  8: [{ title: "FlightAssist deadline", type: "work", color: "#FB923C" }],
  12: [{ title: "Ramadan begins (expected)", type: "islamic", color: "#FBBF24" }],
  15: [{ title: "Data Structures exam", type: "exam", color: "#F87171" }],
  20: [{ title: "Ayyam al-Beed fasting", type: "fasting", color: "#34D399" }],
  21: [{ title: "Ayyam al-Beed fasting", type: "fasting", color: "#34D399" }],
  22: [{ title: "Ayyam al-Beed fasting", type: "fasting", color: "#34D399" }],
  26: [{ title: "Freelance payment due", type: "finance", color: "#4ADE80" }],
};

const ISLAMIC_DAYS = { 1: "Monday fasting", 4: "Thursday fasting", 8: "Monday fasting", 11: "Thursday fasting", 15: "Monday fasting", 18: "Thursday fasting", 22: "Monday fasting", 25: "Thursday fasting", 29: "Monday fasting" };
const TODAY = 30;

const TODAY_AGENDA = [
  { time: "4:32", title: "صلاة الفجر", type: "prayer", color: "#A78BFA" },
  { time: "5:00", title: "أذكار الصباح + قرآن", type: "worship", color: "#FBBF24" },
  { time: "9:00", title: "Physics — Ch.7 review", type: "study", color: "#60A5FA" },
  { time: "12:15", title: "صلاة الظهر", type: "prayer", color: "#A78BFA" },
  { time: "1:00", title: "FlightAssist API work", type: "work", color: "#FB923C" },
  { time: "3:45", title: "صلاة العصر", type: "prayer", color: "#A78BFA" },
  { time: "4:15", title: "Quran hifz review", type: "worship", color: "#34D399" },
  { time: "5:00", title: "Gym — upper body", type: "health", color: "#F472B6" },
  { time: "6:22", title: "صلاة المغرب", type: "prayer", color: "#A78BFA" },
  { time: "7:00", title: "Data Structures assignment", type: "study", color: "#60A5FA" },
  { time: "7:42", title: "صلاة العشاء + وتر", type: "prayer", color: "#A78BFA" },
  { time: "10:30", title: "محاسبة النفس + نوم", type: "worship", color: "#818CF8" },
];

function Card({ children, style }) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

export default function CalendarView() {
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const startDayOffset = 6;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:2px; }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, opacity: 0, animation: "fi 0.4s ease forwards" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Calendar size={20} color="#818CF8" />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>التقويم</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Calendar</span>
          </div>
          <div style={{ fontSize: 12, color: MUTED }}>Hijri + Gregorian · Week starts Saturday</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Calendar Grid */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}><ChevronLeft size={18} color={MUTED} /></button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRIGHT }}>March 2026</div>
              <div style={{ fontSize: 12, fontFamily: ar, color: CYAN }}>شوال ١٤٤٧</div>
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}><ChevronRight size={18} color={MUTED} /></button>
          </div>

          {/* Day Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {DAYS_AR.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontFamily: ar, color: MUTED, padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Day Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {Array.from({ length: startDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
            {MONTH_DAYS.map(day => {
              const isToday = day === TODAY;
              const isSelected = day === selectedDay;
              const hasEvent = EVENTS[day];
              const isFasting = ISLAMIC_DAYS[day];
              const isFriday = (day + startDayOffset - 1) % 7 === 6;

              return (
                <div key={day} onClick={() => setSelectedDay(day)} style={{
                  aspectRatio: "1", borderRadius: 10, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                  background: isSelected ? `${CYAN}15` : isToday ? `${CYAN}08` : "transparent",
                  border: isSelected ? `2px solid ${CYAN}40` : isToday ? `1px solid ${CYAN}20` : `1px solid transparent`,
                  transition: "all 0.15s", position: "relative",
                }}>
                  <span style={{
                    fontSize: 14, fontWeight: isToday ? 700 : 400, fontFamily: mono,
                    color: isSelected ? CYAN : isToday ? BRIGHT : isFriday ? "#FBBF24" : TEXT,
                  }}>{day}</span>
                  {hasEvent && (
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                      {hasEvent.map((ev, i) => (
                        <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: ev.color }} />
                      ))}
                    </div>
                  )}
                  {isFasting && !hasEvent && (
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#34D39960", marginTop: 2 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 10, color: MUTED, flexWrap: "wrap" }}>
            {[
              { c: "#F87171", l: "Exam" }, { c: "#FB923C", l: "Work" }, { c: "#FBBF24", l: "Islamic" },
              { c: "#34D399", l: "Fasting" }, { c: "#4ADE80", l: "Finance" },
            ].map(lg => (
              <div key={lg.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: lg.c }} />{lg.l}
              </div>
            ))}
          </div>
        </Card>

        {/* Right - Agenda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Selected Day Events */}
          {EVENTS[selectedDay] && (
            <Card>
              <div style={{ fontSize: 12, fontWeight: 600, color: BRIGHT, marginBottom: 10 }}>
                Events — Day {selectedDay}
              </div>
              {EVENTS[selectedDay].map((ev, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                  borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, marginBottom: 6,
                }}>
                  <div style={{ width: 4, height: 24, borderRadius: 2, background: ev.color }} />
                  <span style={{ fontSize: 12, color: TEXT }}>{ev.title}</span>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${ev.color}12`, color: ev.color, marginLeft: "auto" }}>{ev.type}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Today's Agenda */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={14} color={CYAN} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Today's agenda</span>
              </div>
              <span style={{ fontSize: 10, fontFamily: mono, color: MUTED }}>
                {TODAY_AGENDA.length} items
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {TODAY_AGENDA.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "6px 10px",
                  borderRadius: 6, opacity: 0, animation: `fi 0.3s ease ${i * 0.04}s forwards`,
                }}>
                  <span style={{ fontSize: 11, fontFamily: mono, color: MUTED, width: 40, textAlign: "right" }}>{item.time}</span>
                  <div style={{ width: 3, height: 20, borderRadius: 2, background: item.color }} />
                  <span style={{
                    fontSize: 12, color: TEXT,
                    fontFamily: item.title.match(/[\u0600-\u06FF]/) ? ar : "inherit",
                  }}>{item.title}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={14} color="#F87171" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Upcoming exams</span>
            </div>
            {[
              { title: "Physics exam", days: 5, c: "#F87171" },
              { title: "Data Structures exam", days: 15, c: "#FB923C" },
            ].map(ex => (
              <div key={ex.title} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, marginBottom: 6,
              }}>
                <span style={{ fontSize: 12, color: TEXT }}>{ex.title}</span>
                <span style={{ fontSize: 12, fontFamily: mono, fontWeight: 700, color: ex.c }}>{ex.days}d</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
