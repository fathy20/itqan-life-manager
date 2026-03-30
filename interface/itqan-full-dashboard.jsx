import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Moon, BookOpen, Star, GraduationCap, Briefcase,
  Wallet, Users, Heart, Calendar, Timer, Sparkles, ChevronRight,
  Flame, TrendingUp, Shield, Settings, Bell, Search, Command,
  ChevronLeft, ChevronDown, CheckCircle2, Circle, Clock, Zap,
  Target, Brain, Smartphone, Droplets, Footprints, Dumbbell,
  BarChart3, ArrowUpRight, ArrowDownRight, Swords, Plus,
  BookMarked, Sunrise, Sunset, AlertTriangle, Trophy, Lock,
  LogOut, HelpCircle, MessageSquare, X
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip,
  RadialBarChart, RadialBar
} from "recharts";

// ═══════════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════════

const NAV_SECTIONS = [
  {
    label: "عبادات", labelEn: "Worship",
    items: [
      { id: "salah", nameAr: "الصلاة", icon: Moon, color: "#A78BFA", badge: "العصر" },
      { id: "quran", nameAr: "القرآن", icon: BookOpen, color: "#34D399" },
      { id: "adhkar", nameAr: "الأذكار", icon: Star, color: "#FBBF24" },
      { id: "fasting", nameAr: "الصيام", icon: Sunrise, color: "#FB923C" },
      { id: "zakat", nameAr: "الزكاة", icon: Wallet, color: "#4ADE80" },
    ],
  },
  {
    label: "حياتي", labelEn: "My Life",
    items: [
      { id: "dashboard", nameAr: "الرئيسية", icon: LayoutDashboard, color: "#08A7E7", active: true },
      { id: "study", nameAr: "الدراسة", icon: GraduationCap, color: "#60A5FA", badge: "5d" },
      { id: "work", nameAr: "العمل", icon: Briefcase, color: "#FB923C" },
      { id: "finance", nameAr: "الماليات", icon: Lock, color: "#4ADE80" },
    ],
  },
  {
    label: "تطوير", labelEn: "Growth",
    items: [
      { id: "lifestyle", nameAr: "الصحة", icon: Heart, color: "#F87171" },
      { id: "sibaq", nameAr: "السباق", icon: Users, color: "#F472B6" },
      { id: "knowledge", nameAr: "العلم", icon: BookMarked, color: "#818CF8" },
    ],
  },
  {
    label: "أدوات", labelEn: "Tools",
    items: [
      { id: "calendar", nameAr: "التقويم", icon: Calendar, color: "#818CF8" },
      { id: "focus", nameAr: "التركيز", icon: Timer, color: "#FB923C" },
      { id: "coach", nameAr: "المدرب", icon: Sparkles, color: "#08A7E7" },
    ],
  },
];

const PRAYERS = [
  { name: "الفجر", time: "4:32", status: "done", jamaah: true },
  { name: "الظهر", time: "12:15", status: "done", jamaah: false },
  { name: "العصر", time: "3:45", status: "current" },
  { name: "المغرب", time: "6:22", status: "upcoming" },
  { name: "العشاء", time: "7:42", status: "upcoming" },
];

const WEEK_SCORES = [
  { day: "Sat", score: 78, l: "سبت" }, { day: "Sun", score: 82, l: "أحد" },
  { day: "Mon", score: 91, l: "اثنين" }, { day: "Tue", score: 85, l: "ثلاثاء" },
  { day: "Wed", score: 88, l: "أربعاء" }, { day: "Thu", score: 76, l: "خميس" },
  { day: "Fri", score: 92, l: "جمعة" },
];

const TASKS = [
  { title: "Physics — Ch.7 Electromagnetism", type: "study", done: true },
  { title: "FlightAssist — API integration", type: "work", done: true },
  { title: "Data Structures assignment", type: "study", done: false },
  { title: "Review Surah Al-Mulk", type: "worship", done: false },
  { title: "Upper body workout", type: "health", done: false },
];

const HALAQAH = [
  { name: "Fathy", rank: "متقن", streak: 18, ring: 92, color: "#A78BFA", you: true },
  { name: "Ahmed", rank: "محسن", streak: 12, ring: 78, color: "#FBBF24" },
  { name: "Mohamed", rank: "مجتهد", streak: 7, ring: 61, color: "#34D399" },
  { name: "Khaled", rank: "سالك", streak: 3, ring: 42, color: "#60A5FA" },
];

const SCORES = [
  { label: "Salah", v: 26, max: 30, color: "#A78BFA", icon: Moon },
  { label: "Quran", v: 17, max: 20, color: "#34D399", icon: BookOpen },
  { label: "Adhkar", v: 13, max: 15, color: "#FBBF24", icon: Star },
  { label: "Productivity", v: 12, max: 15, color: "#60A5FA", icon: Zap },
  { label: "Health", v: 7, max: 10, color: "#F472B6", icon: Heart },
  { label: "Bonus", v: 8, max: 10, color: "#FB923C", icon: Sparkles },
];

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30";
const CARD = "#071A3A";
const BORDER = "#0C2550";
const CYAN = "#08A7E7";
const SILVER = "#C0C0C0";
const MUTED = "#3D5A80";
const TEXT = "#C0C8D8";
const BRIGHT = "#E8EBF0";

function AnimNum({ to, dur = 1200 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = 0; const step = to / (dur / 16);
    const id = setInterval(() => { s += step; if (s >= to) { setV(to); clearInterval(id); } else setV(Math.floor(s)); }, 16);
    return () => clearInterval(id);
  }, [to, dur]);
  return <>{v}</>;
}

// ═══════════════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════════════

function Sidebar({ collapsed, setCollapsed }) {
  return (
    <div style={{
      width: collapsed ? 68 : 230, minHeight: "100vh",
      background: "#000A22", borderRight: `1px solid ${BORDER}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
      position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 40,
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "18px 14px" : "18px 18px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${CYAN}30, ${CYAN}10)`,
          border: `1px solid ${CYAN}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield size={17} color={CYAN} />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 17, fontWeight: 700, fontFamily: ar }}>
              <span style={{ color: CYAN }}>إت</span><span style={{ color: SILVER }}>قان</span>
            </span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: "12px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {NAV_SECTIONS.map((sec, si) => (
          <div key={si} style={{ marginBottom: 16 }}>
            {!collapsed && (
              <div style={{
                fontSize: 10, color: MUTED, padding: "4px 12px", marginBottom: 4,
                fontFamily: mono, textTransform: "uppercase", letterSpacing: "1.5px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span>{sec.labelEn}</span>
                <span style={{ fontFamily: ar, fontSize: 10 }}>{sec.label}</span>
              </div>
            )}
            {collapsed && si > 0 && (
              <div style={{ height: 1, background: BORDER, margin: "8px 10px" }} />
            )}
            {sec.items.map((item) => (
              <button key={item.id} style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 10, padding: collapsed ? "10px 0" : "9px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 10, border: "none", cursor: "pointer",
                background: item.active ? `${CYAN}12` : "transparent",
                marginBottom: 2, position: "relative",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = `${item.color}08`; }}
                onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = "transparent"; }}
              >
                {item.active && (
                  <div style={{
                    position: "absolute", left: collapsed ? "50%" : 0,
                    top: "50%", transform: collapsed ? "translate(-50%, -50%)" : "translateY(-50%)",
                    width: collapsed ? 4 : 3, height: 20, borderRadius: 4,
                    background: CYAN,
                  }} />
                )}
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: item.active ? `${CYAN}18` : `${item.color}08`,
                }}>
                  <item.icon size={15} color={item.active ? CYAN : item.color} strokeWidth={1.8} />
                </div>
                {!collapsed && (
                  <>
                    <span style={{
                      fontSize: 13, fontFamily: ar, color: item.active ? CYAN : TEXT,
                      fontWeight: item.active ? 600 : 400, flex: 1, textAlign: "right",
                    }}>{item.nameAr}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: 9, padding: "2px 7px", borderRadius: 6,
                        background: `${item.color}15`, color: item.color,
                        fontFamily: mono,
                      }}>{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${BORDER}` }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, padding: "9px 12px", borderRadius: 10, border: "none",
          background: "transparent", cursor: "pointer",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#0C2550"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {collapsed ? <ChevronRight size={15} color={MUTED} /> : <ChevronLeft size={15} color={MUTED} />}
          {!collapsed && <span style={{ fontSize: 12, color: MUTED }}>Collapse</span>}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Card({ children, style, glow }) {
  return (
    <div style={{
      background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`,
      padding: "18px 20px", position: "relative", overflow: "hidden",
      ...style,
    }}>
      {glow && (
        <div style={{
          position: "absolute", top: -30, right: -30, width: 100, height: 100,
          borderRadius: "50%", background: glow, opacity: 0.04, filter: "blur(30px)",
          pointerEvents: "none",
        }} />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{label}</span>
      </div>
      {right}
    </div>
  );
}

function ScoreRing({ score }) {
  const [a, setA] = useState(0);
  useEffect(() => { const id = setTimeout(() => setA(score), 150); return () => clearTimeout(id); }, [score]);
  const s = 160, r = 65, c = Math.PI * 2 * r;
  const off = c - (c * a) / 100;
  const col = score >= 80 ? CYAN : score >= 60 ? "#FBBF24" : "#34D399";
  return (
    <div style={{ position: "relative", width: s, height: s }}>
      <svg width={s} height={s} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="#0C2550" strokeWidth="9" />
        <circle cx={s/2} cy={s/2} r={r-7} fill="none" stroke="#071A3A" strokeWidth="5" />
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke={col} strokeWidth="9"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)" }} />
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke={col} strokeWidth="18" opacity="0.05"
          strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)", filter: "blur(8px)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 38, fontWeight: 700, color: BRIGHT, fontFamily: mono, letterSpacing: "-2px" }}>
          <AnimNum to={score} />
        </span>
        <span style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "2px" }}>Itqan Score</span>
      </div>
    </div>
  );
}

function MiniRing({ pct, color, size = 34, sw = 3 }) {
  const r = (size - sw * 2) / 2, c = Math.PI * 2 * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#0C2550" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

function ScoreBar({ s, delay }) {
  const [w, setW] = useState(0);
  useEffect(() => { const id = setTimeout(() => setW((s.v / s.max) * 100), 200 + delay); return () => clearTimeout(id); }, [s, delay]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <div style={{
        width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
        background: s.color + "12",
      }}>
        <s.icon size={12} color={s.color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: MUTED }}>{s.label}</span>
          <span style={{ fontSize: 11, fontFamily: mono, color: TEXT }}>{s.v}/{s.max}</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "#0C2550", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2, background: s.color, width: `${w}%`,
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
            boxShadow: `0 0 8px ${s.color}30`,
          }} />
        </div>
      </div>
    </div>
  );
}

function PrayerRow({ p, i }) {
  const bg = p.status === "done" ? "#A78BFA08" : p.status === "current" ? "#FBBF2408" : "transparent";
  const brd = p.status === "done" ? "#A78BFA20" : p.status === "current" ? "#FBBF2420" : BORDER;
  const tc = p.status === "done" ? "#A78BFA" : p.status === "current" ? "#FBBF24" : "#2A4A6A";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8,
      background: bg, border: `1px solid ${brd}`,
      opacity: 0, animation: `fi 0.3s ease ${i * 0.06}s forwards`,
    }}>
      {p.status === "done" ? <CheckCircle2 size={14} color="#A78BFA" /> :
       p.status === "current" ? <Clock size={14} color="#FBBF24" /> :
       <Circle size={14} color="#1A3050" />}
      <span style={{ flex: 1, fontSize: 13, fontFamily: ar, color: tc, fontWeight: p.status === "current" ? 600 : 400 }}>{p.name}</span>
      <span style={{ fontSize: 12, fontFamily: mono, color: p.status === "current" ? "#FBBF24" : MUTED }}>{p.time}</span>
      {p.jamaah && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "#34D39915", color: "#34D399" }}>جماعة</span>}
    </div>
  );
}

function TaskRow({ t, i }) {
  const typeC = { study: "#60A5FA", work: "#FB923C", worship: "#A78BFA", health: "#F472B6" };
  const c = typeC[t.type] || MUTED;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
      borderBottom: `1px solid ${BORDER}`,
      opacity: 0, animation: `fi 0.3s ease ${i * 0.05}s forwards`,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: 4, cursor: "pointer", flexShrink: 0,
        border: t.done ? "none" : `1.5px solid #1A3050`,
        background: t.done ? "#A78BFA" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {t.done && <CheckCircle2 size={10} color="#000E30" />}
      </div>
      <span style={{
        flex: 1, fontSize: 12, color: t.done ? "#2A4A6A" : TEXT,
        textDecoration: t.done ? "line-through" : "none",
      }}>{t.title}</span>
      <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: c + "10", color: c }}>{t.type}</span>
    </div>
  );
}

function MemberRow({ m, i }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8,
      background: m.you ? `${CYAN}06` : "transparent",
      border: m.you ? `1px solid ${CYAN}15` : "1px solid transparent",
      opacity: 0, animation: `fi 0.4s ease ${i * 0.08}s forwards`,
    }}>
      <span style={{ fontSize: 11, fontFamily: mono, color: "#1A3050", width: 14, textAlign: "center" }}>{i + 1}</span>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: m.color + "15", border: `1px solid ${m.color}25`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: m.color }}>{m.name[0]}</span>
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: TEXT }}>{m.name}</span>
        {m.you && <span style={{ fontSize: 9, color: MUTED, marginLeft: 4 }}>(you)</span>}
        <div>
          <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: m.color + "12", color: m.color, fontFamily: ar }}>{m.rank}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Flame size={11} color="#FB923C" />
        <span style={{ fontSize: 11, fontFamily: mono, color: MUTED }}>{m.streak}d</span>
      </div>
      <MiniRing pct={m.ring} color={m.color} />
    </div>
  );
}

function StatBox({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{
      padding: "14px", borderRadius: 10, background: CARD, border: `1px solid ${BORDER}`,
      textAlign: "center",
    }}>
      <Icon size={16} color={color} style={{ marginBottom: 6 }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: BRIGHT, fontFamily: mono }}>
        {value}{sub && <span style={{ fontSize: 10, color: "#1A3050" }}>{sub}</span>}
      </div>
      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px" }}>
      <div style={{ fontSize: 10, color: MUTED, fontFamily: ar }}>{payload[0].payload.l}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: BRIGHT, fontFamily: mono }}>{payload[0].value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════

export default function ItqanApp() {
  const [collapsed, setCollapsed] = useState(false);
  const totalScore = SCORES.reduce((a, b) => a + b.v, 0);
  const sideW = collapsed ? 68 : 230;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: "'Inter', system-ui, sans-serif", color: TEXT }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px ${CYAN}08; } 50% { box-shadow: 0 0 30px ${CYAN}15; } }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:2px; }
      `}</style>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* ── Main Content ────────────────────────────────────── */}
      <div style={{
        marginLeft: sideW, flex: 1, transition: "margin-left 0.3s cubic-bezier(.4,0,.2,1)",
        minWidth: 0,
      }}>
        {/* Top Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 28px", borderBottom: `1px solid ${BORDER}`,
          background: "#000E30E0", backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 600, fontFamily: ar }}>الرئيسية</span>
            <span style={{ fontSize: 12, color: MUTED, marginLeft: 10, fontFamily: mono }}>Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
              borderRadius: 8, background: CARD, border: `1px solid ${BORDER}`, width: 200,
            }}>
              <Search size={13} color={MUTED} />
              <input placeholder="Ctrl+K" style={{
                background: "none", border: "none", outline: "none", fontSize: 12,
                color: TEXT, width: "100%", fontFamily: mono,
              }} />
            </div>
            <button style={{
              width: 34, height: 34, borderRadius: 8, border: `1px solid ${BORDER}`,
              background: CARD, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}>
              <Bell size={14} color={MUTED} />
              <div style={{ position: "absolute", top: 7, right: 7, width: 5, height: 5, borderRadius: "50%", background: CYAN }} />
            </button>
            <div style={{ width: 1, height: 20, background: BORDER }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Fathy</div>
                <div style={{ fontSize: 9, color: CYAN, fontFamily: ar }}>متقن</div>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: `${CYAN}15`, border: `2px solid ${CYAN}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: CYAN }}>F</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{ padding: "24px 28px" }}>
          {/* Greeting Row */}
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            marginBottom: 24, opacity: 0, animation: "fi 0.5s ease forwards",
          }}>
            <div>
              <div style={{ fontSize: 13, color: MUTED, fontFamily: ar, marginBottom: 2 }}>مساء الخير يا فتحي</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: BRIGHT, fontFamily: ar }}>
                نظرة على يومك
              </div>
              <div style={{ fontSize: 11, color: "#1A3050", fontFamily: mono, marginTop: 2 }}>
                Mon, Mar 30, 2026 · <span style={{ fontFamily: ar }}>٥ شوال ١٤٤٧</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { icon: Flame, l: "Streak", v: "18d", c: "#FB923C" },
                { icon: Clock, l: "Next", v: "العصر 3:45", c: "#A78BFA" },
                { icon: BookOpen, l: "Quran", v: "4 pages left", c: "#34D399" },
              ].map(q => (
                <div key={q.l} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 14px",
                  borderRadius: 8, background: CARD, border: `1px solid ${BORDER}`,
                }}>
                  <q.icon size={13} color={q.c} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, fontFamily: q.l === "Next" ? ar : mono }}>{q.v}</div>
                    <div style={{ fontSize: 9, color: MUTED }}>{q.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3-Column Grid ─────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 16 }}>

            {/* ── LEFT COLUMN ──────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Score */}
              <Card glow={CYAN} style={{ animation: "glow 5s ease infinite" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <ScoreRing score={totalScore} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <TrendingUp size={12} color="#34D399" />
                      <span style={{ fontSize: 11, color: "#34D399" }}>+5</span>
                    </div>
                    <span style={{ fontSize: 10, color: MUTED }}>vs yesterday</span>
                  </div>
                </div>
              </Card>
              {/* Breakdown */}
              <Card>
                <SectionHeader icon={BarChart3} label="Breakdown" color={CYAN} right={
                  <span style={{ fontSize: 11, fontFamily: mono, color: CYAN }}>{totalScore}/100</span>
                } />
                {SCORES.map((s, i) => <ScoreBar key={s.label} s={s} delay={i * 60} />)}
              </Card>
            </div>

            {/* ── CENTER COLUMN ─────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Prayers */}
              <Card glow="#A78BFA">
                <SectionHeader icon={Moon} label="Today's prayers" color="#A78BFA" right={
                  <span style={{ fontSize: 11, fontFamily: mono, color: "#A78BFA" }}>2/5</span>
                } />
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {PRAYERS.map((p, i) => <PrayerRow key={p.name} p={p} i={i} />)}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  {["Witr ✓", "Duha", "Qiyam"].map(s => (
                    <div key={s} style={{
                      flex: 1, textAlign: "center", padding: "5px 0", borderRadius: 6, fontSize: 10,
                      background: s.includes("✓") ? "#A78BFA10" : "transparent",
                      color: s.includes("✓") ? "#A78BFA" : "#1A3050",
                      border: s.includes("✓") ? "1px solid #A78BFA20" : `1px solid ${BORDER}`,
                    }}>{s}</div>
                  ))}
                </div>
              </Card>
              {/* Chart */}
              <Card>
                <SectionHeader icon={TrendingUp} label="This week" color="#60A5FA" right={
                  <span style={{ fontSize: 11, color: MUTED }}>
                    Avg: <span style={{ color: "#60A5FA", fontFamily: mono }}>
                      {Math.round(WEEK_SCORES.reduce((a, b) => a + b.score, 0) / 7)}
                    </span>
                  </span>
                } />
                <div style={{ height: 110 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={WEEK_SCORES} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CYAN} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#1A3050" }} />
                      <Tooltip content={<ChartTooltip />} cursor={false} />
                      <Area type="monotone" dataKey="score" stroke={CYAN} strokeWidth={2} fill="url(#sg)"
                        dot={{ r: 3, fill: CYAN, stroke: BG, strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: CYAN, stroke: BG, strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              {/* Tasks */}
              <Card style={{ flex: 1 }}>
                <SectionHeader icon={Target} label="Today's priorities" color="#60A5FA" right={
                  <span style={{ fontSize: 11, fontFamily: mono, color: "#34D399" }}>
                    {TASKS.filter(t => t.done).length}/{TASKS.length}
                  </span>
                } />
                {TASKS.map((t, i) => <TaskRow key={i} t={t} i={i} />)}
                <button style={{
                  width: "100%", marginTop: 10, padding: "7px", borderRadius: 8,
                  background: "transparent", border: `1px dashed ${BORDER}`,
                  color: MUTED, fontSize: 11, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                  <Plus size={12} /> Add task
                </button>
              </Card>
            </div>

            {/* ── RIGHT COLUMN ─────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Quran */}
              <Card glow="#34D399">
                <SectionHeader icon={BookOpen} label="Quran" color="#34D399" right={
                  <span style={{ fontSize: 11, fontFamily: mono, color: "#34D399" }}>65%</span>
                } />
                <div style={{ height: 6, borderRadius: 3, background: "#0C2550", overflow: "hidden", marginBottom: 10 }}>
                  <div style={{
                    height: "100%", width: "65%", borderRadius: 3,
                    background: "linear-gradient(90deg, #34D399, #059669)",
                    boxShadow: "0 0 10px #34D39930",
                  }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ padding: 10, borderRadius: 8, background: BG, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#34D399", fontFamily: mono }}>4</div>
                    <div style={{ fontSize: 9, color: MUTED }}>Pages today</div>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: BG, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#60A5FA", fontFamily: mono }}>3</div>
                    <div style={{ fontSize: 9, color: MUTED }}>Surahs memorized</div>
                  </div>
                </div>
                <div style={{
                  marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "#FBBF2408",
                  border: "1px solid #FBBF2412", display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Brain size={11} color="#FBBF24" />
                  <span style={{ fontSize: 10, color: "#FBBF24" }}>Review: Surah Al-Mulk</span>
                </div>
              </Card>

              {/* Halaqah */}
              <Card glow="#F472B6">
                <SectionHeader icon={Users} label="Halaqah" color="#F472B6" right={
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: CARD, border: `1px solid ${BORDER}`, color: MUTED }}>
                    Software Eng.
                  </span>
                } />
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {HALAQAH.map((m, i) => <MemberRow key={m.name} m={m} i={i} />)}
                </div>
                <div style={{
                  marginTop: 10, padding: "10px 12px", borderRadius: 8,
                  background: `${CYAN}06`, border: `1px solid ${CYAN}12`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <Swords size={11} color={CYAN} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: CYAN }}>Weekly challenge</span>
                  </div>
                  <span style={{ fontSize: 11, color: MUTED }}>Complete morning adhkar daily</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#0C2550", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "60%", borderRadius: 2, background: CYAN }} />
                    </div>
                    <span style={{ fontSize: 9, fontFamily: mono, color: MUTED }}>3/5</span>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <StatBox icon={Smartphone} label="Screen time" value="2h15m" color="#F472B6" />
                <StatBox icon={Droplets} label="Water" value="1.5" sub="L" color="#60A5FA" />
                <StatBox icon={Clock} label="Sleep" value="6.5" sub="h" color="#A78BFA" />
                <StatBox icon={Timer} label="Focus" value="2h10" sub="m" color="#FB923C" />
              </div>

              {/* AI Insight */}
              <Card style={{
                background: `linear-gradient(135deg, ${CYAN}08, ${CYAN}03)`,
                border: `1px solid ${CYAN}15`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Sparkles size={13} color={CYAN} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: CYAN }}>AI insight</span>
                </div>
                <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, margin: 0 }}>
                  Great Fajr consistency this week! Add 2 Quran pages after Fajr. Physics exam Thursday — front-load study today. Screen time over budget by 15min.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
