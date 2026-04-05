import { useState, useEffect } from "react";
import {
  Moon, Sun, Sunrise, Sunset, CheckCircle2, Circle, Clock,
  ChevronLeft, ChevronRight, Flame, TrendingUp, Shield,
  Users, Star, MapPin, Bell, Settings, BarChart3, Calendar,
  Plus, Minus, Award, Zap, ArrowUpRight, RotateCcw,
  Search, X, Eye, EyeOff, ChevronDown
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, Cell } from "recharts";

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30";
const CARD = "#071A3A";
const BORDER = "#0C2550";
const CYAN = "#08A7E7";
const MUTED = "#3D5A80";
const TEXT = "#C0C8D8";
const BRIGHT = "#E8EBF0";

const PRAYERS_TODAY = [
  {
    id: "fajr", nameAr: "الفجر", nameEn: "Fajr", time: "4:32", adhan: "4:32", iqama: "4:50",
    status: "done", loggedAt: "4:35", jamaah: true, sunnah: { before: true, after: false },
    icon: Sunrise, color: "#A78BFA", period: "dawn",
  },
  {
    id: "dhuhr", nameAr: "الظهر", nameEn: "Dhuhr", time: "12:15", adhan: "12:15", iqama: "12:35",
    status: "done", loggedAt: "12:20", jamaah: false, sunnah: { before: true, after: true },
    icon: Sun, color: "#FBBF24", period: "noon",
  },
  {
    id: "asr", nameAr: "العصر", nameEn: "Asr", time: "3:45", adhan: "3:45", iqama: "4:00",
    status: "current", jamaah: false, sunnah: {},
    icon: Sun, color: "#FB923C", period: "afternoon",
  },
  {
    id: "maghrib", nameAr: "المغرب", nameEn: "Maghrib", time: "6:22", adhan: "6:22", iqama: "6:27",
    status: "upcoming", jamaah: false, sunnah: {},
    icon: Sunset, color: "#F472B6", period: "sunset",
  },
  {
    id: "isha", nameAr: "العشاء", nameEn: "Isha", time: "7:42", adhan: "7:42", iqama: "8:00",
    status: "upcoming", jamaah: false, sunnah: {},
    icon: Moon, color: "#818CF8", period: "night",
  },
];

const EXTRAS = [
  { id: "witr", nameAr: "الوتر", done: true, color: "#A78BFA" },
  { id: "duha", nameAr: "الضحى", done: false, color: "#FBBF24" },
  { id: "qiyam", nameAr: "قيام الليل", done: false, color: "#818CF8" },
  { id: "rawatib", nameAr: "الرواتب", done: true, color: "#34D399" },
];

const WEEK_DATA = [
  { day: "سبت", onTime: 5, late: 0, missed: 0, total: 5, jamaah: 3 },
  { day: "أحد", onTime: 4, late: 1, missed: 0, total: 5, jamaah: 2 },
  { day: "اثنين", onTime: 5, late: 0, missed: 0, total: 5, jamaah: 4 },
  { day: "ثلاثاء", onTime: 4, late: 0, missed: 1, total: 4, jamaah: 1 },
  { day: "أربعاء", onTime: 5, late: 0, missed: 0, total: 5, jamaah: 3 },
  { day: "خميس", onTime: 3, late: 2, missed: 0, total: 5, jamaah: 2 },
  { day: "جمعة", onTime: 5, late: 0, missed: 0, total: 5, jamaah: 5 },
];

const MONTHLY_HEATMAP = Array.from({ length: 30 }, (_, i) => {
  const r = Math.random();
  return {
    day: i + 1,
    score: r > 0.8 ? 5 : r > 0.5 ? 4 : r > 0.25 ? 3 : r > 0.1 ? 2 : 1,
  };
});

function AnimNum({ to, dur = 1000 }: any) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = 0; const step = to / (dur / 16);
    const id = setInterval(() => { s += step; if (s >= to) { setV(to); clearInterval(id); } else setV(Math.floor(s)); }, 16);
    return () => clearInterval(id);
  }, [to, dur]);
  return <>{v}</>;
}

function Card({ children, style, glow }: any) {
  return (
    <div style={{
      background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`,
      padding: "18px 20px", position: "relative", overflow: "hidden", ...style,
    }}>
      {glow && <div style={{
        position: "absolute", top: -30, right: -30, width: 100, height: 100,
        borderRadius: "50%", background: glow, opacity: 0.04, filter: "blur(30px)", pointerEvents: "none",
      }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function CountdownTimer() {
  const [secs, setSecs] = useState(8100);
  useEffect(() => { const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000); return () => clearInterval(id); }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return (
    <span style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: "#FBBF24", letterSpacing: "-1px" }}>
      {h > 0 && `${h}:`}{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

function PrayerCard({ prayer, index }: any) {
  const [expanded, setExpanded] = useState(false);
  const isDone = prayer.status === "done";
  const isCurrent = prayer.status === "current";
  const isUpcoming = prayer.status === "upcoming";

  const statusColors = {
    done: { bg: `${prayer.color}08`, border: `${prayer.color}25`, text: prayer.color },
    current: { bg: "#FBBF2406", border: "#FBBF2430", text: "#FBBF24" },
    upcoming: { bg: "transparent", border: BORDER, text: "#1A3050" },
  };
  const sc = statusColors[prayer.status];

  return (
    <div style={{
      borderRadius: 14, overflow: "hidden",
      border: `1px solid ${sc.border}`,
      background: sc.bg,
      opacity: 0, animation: `fi 0.4s ease ${index * 0.07}s forwards`,
      transition: "all 0.3s",
    }}>
      {/* Main Row */}
      <div
        onClick={() => isDone && setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
          cursor: isDone ? "pointer" : "default",
        }}
      >
        {/* Status Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
          background: isDone ? `${prayer.color}18` : isCurrent ? "#FBBF2415" : `${BORDER}50`,
          border: `1px solid ${isDone ? `${prayer.color}30` : isCurrent ? "#FBBF2430" : BORDER}`,
          boxShadow: isCurrent ? "0 0 20px #FBBF2415" : "none",
        }}>
          {isDone ? <CheckCircle2 size={20} color={prayer.color} /> :
           isCurrent ? <prayer.icon size={20} color="#FBBF24" /> :
           <prayer.icon size={20} color="#1A3050" />}
        </div>

        {/* Name + Time */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: ar, color: sc.text }}>
              {prayer.nameAr}
            </span>
            <span style={{ fontSize: 11, fontFamily: mono, color: MUTED, textTransform: "uppercase" }}>
              {prayer.nameEn}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: MUTED }}>
              Adhan <span style={{ fontFamily: mono, color: TEXT }}>{prayer.adhan}</span>
            </span>
            <span style={{ fontSize: 12, color: MUTED }}>
              Iqama <span style={{ fontFamily: mono, color: TEXT }}>{prayer.iqama}</span>
            </span>
          </div>
        </div>

        {/* Status + Badges */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {isDone && (
            <div style={{ display: "flex", gap: 5 }}>
              {prayer.jamaah && (
                <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "#34D39912", color: "#34D399", border: "1px solid #34D39920" }}>
                  <Users size={9} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />جماعة
                </span>
              )}
              {(prayer.sunnah?.before || prayer.sunnah?.after) && (
                <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "#60A5FA12", color: "#60A5FA", border: "1px solid #60A5FA20" }}>
                  <Star size={9} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />سنة
                </span>
              )}
            </div>
          )}
          {isDone && (
            <span style={{ fontSize: 11, fontFamily: mono, color: prayer.color }}>
              {prayer.loggedAt}
              <span style={{ color: MUTED, marginLeft: 4, fontSize: 10 }}>logged</span>
            </span>
          )}
          {isCurrent && (
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20, fontFamily: mono,
              background: "#FBBF2415", color: "#FBBF24", border: "1px solid #FBBF2425",
              animation: "pulse 2s infinite",
            }}>NOW</span>
          )}
          {isUpcoming && (
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: mono, color: "#1A3050" }}>
              {prayer.time}
            </span>
          )}
        </div>

        {isDone && (
          <ChevronDown size={14} color={MUTED}
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
        )}
      </div>

      {/* Expanded - Log Options */}
      {isDone && expanded && (
        <div style={{
          padding: "0 20px 16px", borderTop: `1px solid ${BORDER}`,
          display: "flex", gap: 8, paddingTop: 12, flexWrap: "wrap",
        }}>
          {["On time", "Late", "Qada"].map(opt => (
            <button key={opt} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
              background: opt === "On time" ? `${prayer.color}18` : "transparent",
              border: opt === "On time" ? `1px solid ${prayer.color}30` : `1px solid ${BORDER}`,
              color: opt === "On time" ? prayer.color : MUTED,
            }}>{opt}</button>
          ))}
          <div style={{ width: 1, height: 28, background: BORDER, margin: "0 4px" }} />
          <button style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
            background: prayer.jamaah ? "#34D39918" : "transparent",
            border: prayer.jamaah ? "1px solid #34D39930" : `1px solid ${BORDER}`,
            color: prayer.jamaah ? "#34D399" : MUTED,
          }}>Jamaah</button>
          <button style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
            background: "transparent", border: `1px solid ${BORDER}`, color: MUTED,
          }}>Sunnah before</button>
          <button style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
            background: "transparent", border: `1px solid ${BORDER}`, color: MUTED,
          }}>Sunnah after</button>
        </div>
      )}

      {/* Current Prayer - Action Bar */}
      {isCurrent && (
        <div style={{
          padding: "12px 20px", borderTop: "1px solid #FBBF2415",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["On time", "Late"].map(opt => (
              <button key={opt} style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: opt === "On time" ? "#FBBF24" : "transparent",
                border: opt === "On time" ? "none" : "1px solid #FBBF2430",
                color: opt === "On time" ? "#000E30" : "#FBBF24",
              }}>
                {opt === "On time" ? <><CheckCircle2 size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Prayed on time</> : "Late"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
              background: "transparent", border: "1px solid #FBBF2420", color: "#FBBF24",
            }}>+ Jamaah</button>
            <button style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
              background: "transparent", border: "1px solid #FBBF2420", color: "#FBBF24",
            }}>+ Sunnah</button>
          </div>
        </div>
      )}
    </div>
  );
}

function HeatmapCell({ day, score }: any) {
  const colors = ["#0C2550", "#08A7E720", "#08A7E740", "#08A7E770", "#08A7E7A0", "#08A7E7"];
  return (
    <div title={`Day ${day}: ${score}/5 prayers`} style={{
      width: 28, height: 28, borderRadius: 6,
      background: colors[score] || colors[0],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 9, color: score >= 4 ? "#000E30" : score >= 2 ? CYAN : "#1A3050",
      fontFamily: mono, fontWeight: 600, cursor: "pointer",
      transition: "transform 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {day}
    </div>
  );
}

function WeekBarTooltip({ active, payload }: any = {}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 11, color: MUTED, fontFamily: ar, marginBottom: 4 }}>{d.day}</div>
      <div style={{ fontSize: 10, color: "#34D399" }}>On time: {d.onTime}</div>
      {d.late > 0 && <div style={{ fontSize: 10, color: "#FBBF24" }}>Late: {d.late}</div>}
      {d.missed > 0 && <div style={{ fontSize: 10, color: "#F87171" }}>Missed: {d.missed}</div>}
      <div style={{ fontSize: 10, color: "#60A5FA", marginTop: 2 }}>Jamaah: {d.jamaah}</div>
    </div>
  );
}

export default function SalahSystem() {
  const [qadaCount, setQadaCount] = useState(15);
  const prayedCount = PRAYERS_TODAY.filter(p => p.status === "done").length;
  const jamaahCount = PRAYERS_TODAY.filter(p => p.jamaah).length;
  const weekOnTime = WEEK_DATA.reduce((a, b) => a + b.onTime, 0);
  const weekTotal = WEEK_DATA.reduce((a, b) => a + b.total, 0);
  const weekPct = Math.round((weekOnTime / 35) * 100);

  return (
    <div style={{
      minHeight: "100vh", background: BG, color: TEXT,
      fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px #FBBF2410; } 50% { box-shadow: 0 0 35px #FBBF2425; } }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: 28, opacity: 0, animation: "fi 0.4s ease forwards",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Moon size={20} color="#A78BFA" />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>الصلاة</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Salah Tracker</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: MUTED }}>
            <MapPin size={12} />
            <span>Cairo, Egypt</span>
            <span style={{ color: "#1A3050" }}>·</span>
            <span>Method: Egyptian Authority</span>
            <span style={{ color: "#1A3050" }}>·</span>
            <span style={{ fontFamily: ar }}>٥ شوال ١٤٤٧</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
            background: CARD, border: `1px solid ${BORDER}`, color: MUTED,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Calendar size={13} /> History
          </button>
          <button style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
            background: CARD, border: `1px solid ${BORDER}`, color: MUTED,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Settings size={13} /> Settings
          </button>
        </div>
      </div>

      {/* ── Top Stats Row ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.3fr", gap: 14, marginBottom: 20 }}>
        {/* Next Prayer Countdown */}
        <Card glow="#FBBF24" style={{ animation: "glow 4s ease infinite" }}>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>
            Next prayer
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: "#FBBF24" }}>العصر</span>
            <span style={{ fontSize: 14, fontFamily: mono, color: MUTED }}>3:45 PM</span>
          </div>
          <CountdownTimer />
          <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>remaining</div>
        </Card>

        {/* Today's Progress */}
        <Card>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>
            Today
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: mono, color: "#A78BFA" }}>{prayedCount}</span>
            <span style={{ fontSize: 16, color: "#1A3050", fontFamily: mono }}>/5</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>prayers completed</div>
          <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
            {PRAYERS_TODAY.map(p => (
              <div key={p.id} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: p.status === "done" ? p.color : p.status === "current" ? "#FBBF2440" : "#0C2550",
                boxShadow: p.status === "done" ? `0 0 6px ${p.color}30` : "none",
              }} />
            ))}
          </div>
        </Card>

        {/* Jamaah */}
        <Card>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>
            Jamaah today
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: mono, color: "#34D399" }}>{jamaahCount}</span>
            <span style={{ fontSize: 16, color: "#1A3050", fontFamily: mono }}>/{prayedCount}</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>in congregation</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10 }}>
            <TrendingUp size={12} color="#34D399" />
            <span style={{ fontSize: 11, color: "#34D399" }}>27x reward per prayer</span>
          </div>
        </Card>

        {/* Weekly On-Time Rate */}
        <Card glow={CYAN}>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>
            This week — on time rate
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", width: 70, height: 70 }}>
              <svg width={70} height={70} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={35} cy={35} r={28} fill="none" stroke="#0C2550" strokeWidth="7" />
                <circle cx={35} cy={35} r={28} fill="none" stroke={CYAN} strokeWidth="7"
                  strokeDasharray={Math.PI * 56} strokeDashoffset={Math.PI * 56 * (1 - weekPct / 100)}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, fontFamily: mono, color: CYAN,
              }}>{weekPct}%</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: TEXT }}><span style={{ fontFamily: mono, color: "#34D399" }}>{weekOnTime}</span> on time</div>
              <div style={{ fontSize: 12, color: TEXT }}><span style={{ fontFamily: mono, color: "#FBBF24" }}>{weekTotal - weekOnTime}</span> late/missed</div>
              <div style={{ fontSize: 12, color: TEXT }}><span style={{ fontFamily: mono, color: "#60A5FA" }}>{WEEK_DATA.reduce((a, b) => a + b.jamaah, 0)}</span> jamaah</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>

        {/* ── LEFT: Prayer Cards ────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PRAYERS_TODAY.map((p, i) => <PrayerCard key={p.id} prayer={p} index={i} />)}

          {/* Extra Prayers */}
          <Card style={{ marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Star size={14} color="#FBBF24" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Voluntary prayers</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {EXTRAS.map(e => (
                <button key={e.id} style={{
                  padding: "12px 8px", borderRadius: 10, textAlign: "center", cursor: "pointer",
                  background: e.done ? `${e.color}10` : "transparent",
                  border: `1px solid ${e.done ? `${e.color}30` : BORDER}`,
                  transition: "all 0.2s",
                }}>
                  {e.done ? <CheckCircle2 size={16} color={e.color} /> : <Circle size={16} color="#1A3050" />}
                  <div style={{
                    fontSize: 12, fontFamily: ar, marginTop: 6,
                    color: e.done ? e.color : MUTED,
                  }}>{e.nameAr}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ── RIGHT: Stats + Heatmap + Qada ─────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Weekly Bar Chart */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={14} color="#60A5FA" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>This week</span>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#34D399" }} /><span style={{ color: MUTED }}>On time</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#FBBF24" }} /><span style={{ color: MUTED }}>Late</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#F87171" }} /><span style={{ color: MUTED }}>Missed</span></div>
              </div>
            </div>
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEK_DATA} barGap={2}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: ar }} />
                  <Tooltip content={<WeekBarTooltip />} cursor={false} />
                  <Bar dataKey="onTime" stackId="a" fill="#34D399" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="late" stackId="a" fill="#FBBF24" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="missed" stackId="a" fill="#F87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Monthly Heatmap */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={14} color="#818CF8" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  <span style={{ fontFamily: ar }}>شوال ١٤٤٧</span>
                  <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>March 2026</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: MUTED }}>
                <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} style={{
                      width: 10, height: 10, borderRadius: 2,
                      background: n === 1 ? "#0C2550" : n === 2 ? "#08A7E720" : n === 3 ? "#08A7E740" : n === 4 ? "#08A7E770" : "#08A7E7",
                    }} />
                  ))}
                </div>
                <span>1-5 prayers</span>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-start" }}>
              {MONTHLY_HEATMAP.map(d => <HeatmapCell key={d.day} day={d.day} score={d.score} />)}
            </div>
          </Card>

          {/* Qada Counter */}
          <Card glow="#F87171">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <RotateCcw size={14} color="#F87171" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Qada prayers</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#F8717112", color: "#F87171" }}>
                {qadaCount} remaining
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, fontFamily: mono, color: "#F87171" }}>{qadaCount}</span>
                  <span style={{ fontSize: 14, color: MUTED }}>prayers owed</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#0C2550", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${((30 - qadaCount) / 30) * 100}%`, borderRadius: 3,
                    background: "linear-gradient(90deg, #34D399, #059669)",
                    transition: "width 0.5s",
                  }} />
                </div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>
                  {30 - qadaCount} completed · started with 30
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={() => setQadaCount(Math.max(0, qadaCount - 1))} style={{
                  width: 44, height: 44, borderRadius: 10, cursor: "pointer",
                  background: "#34D39918", border: "1px solid #34D39930",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Minus size={18} color="#34D399" />
                </button>
                <button onClick={() => setQadaCount(qadaCount + 1)} style={{
                  width: 44, height: 44, borderRadius: 10, cursor: "pointer",
                  background: "transparent", border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Plus size={18} color={MUTED} />
                </button>
              </div>
            </div>
          </Card>

          {/* Salah Score */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Award size={14} color="#A78BFA" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Salah score</span>
              <span style={{ fontSize: 14, fontFamily: mono, fontWeight: 700, color: "#A78BFA", marginLeft: "auto" }}>26/30</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { l: "On time", v: "2×4", pts: "8", c: "#34D399" },
                { l: "Jamaah", v: "+1", pts: "2", c: "#60A5FA" },
                { l: "Sunnah", v: "4 done", pts: "2", c: "#FBBF24" },
                { l: "Witr", v: "done", pts: "2", c: "#A78BFA" },
              ].map(s => (
                <div key={s.l} style={{
                  padding: "8px 12px", borderRadius: 8, background: BG,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: MUTED }}>{s.l}</div>
                    <div style={{ fontSize: 11, fontFamily: mono, color: TEXT }}>{s.v}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: mono, color: s.c }}>+{s.pts}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
