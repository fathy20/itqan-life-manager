import { useState } from "react";
import {
  Star, Sun, Moon, CheckCircle2, Circle, RotateCcw,
  Plus, Minus, Clock, Heart, BookOpen, Sparkles,
  ChevronRight, Award, Zap, Search, Flame, BarChart3
} from "lucide-react";
import { useAdhkar } from '../hooks/useAdhkar';

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";
const GOLD = "#FBBF24";

const ADHKAR_BLOCKS = [
  { id: "morning", nameAr: "أذكار الصباح", nameEn: "Morning Adhkar", icon: Sun, color: GOLD, time: "After Fajr", done: true, completedAt: "5:10 AM", totalItems: 15 },
  { id: "evening", nameAr: "أذكار المساء", nameEn: "Evening Adhkar", icon: Moon, color: "#A78BFA", time: "Before Maghrib", done: false, totalItems: 15 },
  { id: "sleep", nameAr: "أذكار النوم", nameEn: "Sleep Adhkar", icon: Moon, color: "#818CF8", time: "Before sleep", done: false, totalItems: 8 },
  { id: "afterPrayer", nameAr: "أذكار بعد الصلاة", nameEn: "After Prayer", icon: Star, color: "#34D399", time: "After each salah", done: true, count: "3/5 prayers", totalItems: 6 },
];

const COUNTERS_INIT = [
  { id: "istighfar", nameAr: "الاستغفار", nameEn: "Istighfar", target: 100, color: "#A78BFA", text: "أستغفر الله العظيم وأتوب إليه" },
  { id: "salawat", nameAr: "الصلاة على النبي", nameEn: "Salawat", target: 100, color: GOLD, text: "اللهم صلِّ وسلم على نبينا محمد" },
  { id: "subhan", nameAr: "سبحان الله", nameEn: "SubhanAllah", target: 33, color: "#34D399", text: "سبحان الله" },
  { id: "hamd", nameAr: "الحمد لله", nameEn: "Alhamdulillah", target: 33, color: "#60A5FA", text: "الحمد لله" },
  { id: "takbeer", nameAr: "الله أكبر", nameEn: "Allahu Akbar", target: 33, color: "#FB923C", text: "الله أكبر" },
  { id: "hawqala", nameAr: "لا حول ولا قوة إلا بالله", nameEn: "Hawqala", target: 50, color: "#F472B6", text: "لا حول ولا قوة إلا بالله" },
];

const DUA_CATEGORIES = [
  { name: "السفر", en: "Travel", count: 8, color: "#60A5FA" },
  { name: "الامتحان", en: "Exams", count: 5, color: "#A78BFA" },
  { name: "الطعام", en: "Food", count: 6, color: "#34D399" },
  { name: "المطر", en: "Rain", count: 3, color: "#818CF8" },
  { name: "الرزق", en: "Rizq", count: 7, color: GOLD },
  { name: "الشفاء", en: "Healing", count: 6, color: "#F472B6" },
  { name: "الحزن", en: "Sadness", count: 5, color: "#FB923C" },
  { name: "الصباح", en: "Morning", count: 10, color: "#34D399" },
];

const WEEK = [
  { day: "S", done: true }, { day: "S", done: true }, { day: "M", done: true },
  { day: "T", done: false }, { day: "W", done: true }, { day: "T", done: true },
  { day: "F", done: false },
];

function Card({ children, style, glow }) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", position: "relative", overflow: "hidden", ...style }}>
      {glow && <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: glow, opacity: 0.04, filter: "blur(30px)", pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function Counter({ data, initial = 0 }) {
  const [count, setCount] = useState(initial);
  const pct = Math.min((count / data.target) * 100, 100);
  const done = count >= data.target;

  return (
    <div style={{
      padding: "16px", borderRadius: 12, background: BG, border: `1px solid ${done ? `${data.color}30` : BORDER}`,
      transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, fontFamily: ar, color: done ? data.color : BRIGHT }}>{data.nameAr}</span>
          <div style={{ fontSize: 10, color: MUTED, fontFamily: mono }}>{data.nameEn}</div>
        </div>
        <span style={{ fontSize: 12, fontFamily: mono, color: done ? data.color : TEXT }}>{count}/{data.target}</span>
      </div>

      <div style={{ fontSize: 13, fontFamily: ar, color: `${data.color}90`, textAlign: "center", padding: "8px 0", marginBottom: 8, lineHeight: 1.6 }}>
        {data.text}
      </div>

      <div style={{ height: 4, borderRadius: 2, background: "#0C2550", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: data.color, transition: "width 0.3s", boxShadow: done ? `0 0 8px ${data.color}30` : "none" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <button onClick={() => setCount(Math.max(0, count - 1))} style={{
          width: 40, height: 40, borderRadius: 10, cursor: "pointer", background: "transparent",
          border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center",
        }}><Minus size={16} color={MUTED} /></button>

        <button onClick={() => setCount(count + 1)} style={{
          width: 64, height: 64, borderRadius: "50%", cursor: "pointer",
          background: done ? `${data.color}15` : `${data.color}10`,
          border: `2px solid ${done ? `${data.color}40` : `${data.color}25`}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s", fontSize: 22, fontWeight: 700, fontFamily: mono, color: data.color,
        }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {done ? <CheckCircle2 size={24} color={data.color} /> : "+1"}
        </button>

        <button onClick={() => setCount(0)} style={{
          width: 40, height: 40, borderRadius: 10, cursor: "pointer", background: "transparent",
          border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center",
        }}><RotateCcw size={14} color={MUTED} /></button>
      </div>
    </div>
  );
}

export default function AdhkarSystem() {
  const { todayLog, stats, loading, logBlock, updateCounter } = useAdhkar();
  const ADHKAR_BLOCKS_LIVE = ADHKAR_BLOCKS.map(b => ({
    ...b,
    done: todayLog ? (b.id === 'morning' ? todayLog.morning?.completed : b.id === 'evening' ? todayLog.evening?.completed : b.id === 'sleep' ? todayLog.sleep?.completed : b.id === 'afterPrayer' ? (todayLog.afterPrayer?.count || 0) >= 3 : false) : b.done
  }));
  const completedBlocks = ADHKAR_BLOCKS_LIVE.filter(b => b.done).length;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, opacity: 0, animation: "fi 0.4s ease forwards" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Star size={20} color={GOLD} />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>الأذكار والأدعية</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Adhkar & Dua</span>
          </div>
          <div style={{ fontSize: 12, color: MUTED }}>Daily remembrance and supplication tracker</div>
        </div>
      </div>

      {/* Adhkar Blocks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {ADHKAR_BLOCKS_LIVE.map((b, i) => (
          <Card key={b.id} glow={b.done ? b.color : undefined} style={{
            cursor: "pointer", opacity: 0, animation: `fi 0.4s ease ${i * 0.06}s forwards`,
            borderColor: b.done ? `${b.color}30` : BORDER,
          }}
            onClick={() => logBlock(b.id)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: b.done ? `${b.color}18` : "#0C2550", border: `1px solid ${b.done ? `${b.color}30` : BORDER}`,
              }}>
                {b.done ? <CheckCircle2 size={18} color={b.color} /> : <b.icon size={18} color={MUTED} />}
              </div>
              {b.done && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: `${b.color}12`, color: b.color }}>Done</span>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: ar, color: b.done ? b.color : TEXT, marginBottom: 2 }}>{b.nameAr}</div>
            <div style={{ fontSize: 11, color: MUTED }}>{b.time}</div>
            {b.completedAt && <div style={{ fontSize: 10, fontFamily: mono, color: `${b.color}80`, marginTop: 4 }}>Completed at {b.completedAt}</div>}
            {b.count && <div style={{ fontSize: 10, fontFamily: mono, color: `${b.color}80`, marginTop: 4 }}>{b.count}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
              <span style={{ fontSize: 10, color: MUTED }}>{b.totalItems} adhkar</span>
              <ChevronRight size={12} color={MUTED} />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* LEFT - Counters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={14} color={GOLD} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Tap counters</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 10, color: MUTED, fontFamily: mono }}>Tap the circle to count</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {COUNTERS_INIT.map((c, i) => (
                <Counter key={c.id} data={c} initial={Math.floor(Math.random() * c.target * 0.8)} />
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT - Stats + Dua Library */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Weekly Consistency */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <BarChart3 size={14} color={CYAN} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>This week</span>
              <span style={{ fontSize: 11, fontFamily: mono, color: CYAN, marginLeft: "auto" }}>{WEEK.filter(w => w.done).length}/7</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {WEEK.map((w, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{
                    height: 36, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                    background: w.done ? `${CYAN}15` : "#0C2550",
                    border: `1px solid ${w.done ? `${CYAN}30` : "#0C255080"}`,
                    marginBottom: 4,
                  }}>
                    {w.done ? <CheckCircle2 size={14} color={CYAN} /> : <Circle size={14} color="#1A3050" />}
                  </div>
                  <span style={{ fontSize: 9, color: MUTED }}>{w.day}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, background: BG }}>
              <Flame size={12} color="#FB923C" />
              <span style={{ fontSize: 11, color: TEXT }}>Best streak: <span style={{ fontFamily: mono, color: "#FB923C" }}>5 days</span></span>
            </div>
          </Card>

          {/* Adhkar Score */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={14} color={GOLD} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Adhkar score</span>
              </div>
              <span style={{ fontSize: 14, fontFamily: mono, fontWeight: 700, color: GOLD }}>13/15</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { l: "Morning adhkar", v: "complete", pts: "5", c: "#34D399" },
                { l: "Evening adhkar", v: "pending", pts: "0", c: MUTED },
                { l: "After-prayer (3+)", v: "3 done", pts: "3", c: "#34D399" },
                { l: "Sleep adhkar", v: "pending", pts: "0", c: MUTED },
                { l: "Istighfar 100+", v: "73/100", pts: "0", c: MUTED },
                { l: "Salawat 100+", v: "done", pts: "2", c: GOLD },
              ].map(s => (
                <div key={s.l} style={{ padding: "6px 10px", borderRadius: 6, background: BG, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 9, color: MUTED }}>{s.l}</div>
                    <div style={{ fontSize: 10, fontFamily: mono, color: TEXT }}>{s.v}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: mono, color: s.c }}>+{s.pts}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Dua Library */}
          <Card glow="#F472B6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={14} color="#F472B6" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Dua library</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: BG, border: `1px solid ${BORDER}` }}>
                <Search size={12} color={MUTED} />
                <input placeholder="Search duas..." style={{ background: "none", border: "none", outline: "none", fontSize: 11, color: TEXT, width: 100, fontFamily: "inherit" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {DUA_CATEGORIES.map(c => (
                <button key={c.en} style={{
                  padding: "10px 12px", borderRadius: 8, background: BG, border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${c.color}06`; e.currentTarget.style.borderColor = `${c.color}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = BG; e.currentTarget.style.borderColor = BORDER; }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontFamily: ar, fontWeight: 600, color: TEXT, textAlign: "left" }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: MUTED, textAlign: "left" }}>{c.en}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: mono, color: c.color }}>{c.count}</span>
                    <ChevronRight size={12} color={MUTED} />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
