import { useState, useEffect } from "react";
import {
  Users, Flame, TrendingUp, Trophy, Swords, Heart, Shield,
  Crown, Star, ChevronRight, Plus, Send, MessageSquare,
  Target, Award, Zap, Lock, Eye, EyeOff, Copy, Check,
  BarChart3, ArrowUpRight, Moon, BookOpen, Sparkles,
  UserPlus, LogOut, Settings, Bell, ChevronDown, X
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30";
const CARD = "#071A3A";
const BORDER = "#0C2550";
const CYAN = "#08A7E7";
const MUTED = "#3D5A80";
const TEXT = "#C0C8D8";
const BRIGHT = "#E8EBF0";

const RANKS = {
  "متقن": { color: "#A78BFA", icon: Crown, glow: true, tier: 5 },
  "محسن": { color: "#FBBF24", icon: Award, glow: false, tier: 4 },
  "مجتهد": { color: "#34D399", icon: Target, glow: false, tier: 3 },
  "سالك": { color: "#60A5FA", icon: Star, glow: false, tier: 2 },
  "مبتدئ": { color: "#6B7280", icon: Shield, glow: false, tier: 1 },
};

const MY_SCORE = {
  total: 83, rank: "متقن", streak: 18, weeklyRing: 85,
  weekScores: [78, 82, 91, 85, 88, 76, 92],
  breakdown: [
    { label: "Salah", v: 26, max: 30, color: "#A78BFA" },
    { label: "Quran", v: 17, max: 20, color: "#34D399" },
    { label: "Adhkar", v: 13, max: 15, color: "#FBBF24" },
    { label: "Productivity", v: 12, max: 15, color: "#60A5FA" },
    { label: "Health", v: 7, max: 10, color: "#F472B6" },
    { label: "Bonus", v: 8, max: 10, color: "#FB923C" },
  ],
};

const MEMBERS = [
  { name: "Fathy", rank: "متقن", streak: 18, ring: 92, color: "#A78BFA", you: true, trend: "up", delta: 5 },
  { name: "Ahmed", rank: "محسن", streak: 12, ring: 78, color: "#FBBF24", trend: "up", delta: 3 },
  { name: "Mohamed", rank: "مجتهد", streak: 7, ring: 61, color: "#34D399", trend: "same", delta: 0 },
  { name: "Khaled", rank: "سالك", streak: 3, ring: 42, color: "#60A5FA", trend: "down", delta: -2 },
  { name: "Omar", rank: "مجتهد", streak: 9, ring: 58, color: "#34D399", trend: "up", delta: 8 },
];

const DUAS = [
  { text: "Please make du'a for my exam next Thursday", count: 4, timeAgo: "2h" },
  { text: "My mother is in hospital, please remember her", count: 5, timeAgo: "5h" },
  { text: "Starting a new job, need barakah", count: 3, timeAgo: "1d" },
];

const CHALLENGE = {
  title: "Complete morning adhkar every day",
  titleAr: "أتم أذكار الصباح كل يوم",
  daysTotal: 7,
  daysCompleted: 5,
  membersToday: 3,
  membersTotal: 5,
  type: "adhkar",
};

const PREV_CHALLENGES = [
  { title: "Read 1 juz this week", completed: true, participants: "4/5" },
  { title: "Fast Monday & Thursday", completed: true, participants: "3/5" },
  { title: "Pray all 5 on time for 3 days", completed: false, participants: "2/5" },
];

const WEEK_CHART = [
  { day: "S", s: 78 }, { day: "S", s: 82 }, { day: "M", s: 91 },
  { day: "T", s: 85 }, { day: "W", s: 88 }, { day: "T", s: 76 }, { day: "F", s: 92 },
];

function AnimNum({ to, dur = 1000 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = 0; const step = to / (dur / 16);
    const id = setInterval(() => { s += step; if (s >= to) { setV(to); clearInterval(id); } else setV(Math.floor(s)); }, 16);
    return () => clearInterval(id);
  }, [to, dur]);
  return <>{v}</>;
}

function Card({ children, style, glow }) {
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

function BigRing({ pct, color, size = 140 }) {
  const [a, setA] = useState(0);
  useEffect(() => { setTimeout(() => setA(pct), 200); }, [pct]);
  const r = (size - 16) / 2, c = Math.PI * 2 * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#0C2550" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={c - (c * a) / 100}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)" }} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="16" opacity="0.06"
          strokeDasharray={c} strokeDashoffset={c - (c * a) / 100}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)", filter: "blur(6px)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: BRIGHT, fontFamily: mono }}>
          <AnimNum to={pct} />%
        </span>
        <span style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px" }}>Weekly ring</span>
      </div>
    </div>
  );
}

function MiniRing({ pct, color, size = 38, sw = 3 }) {
  const r = (size - sw * 2) / 2, c = Math.PI * 2 * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#0C2550" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

function LeaderboardRow({ m, pos, index }) {
  const rankData = RANKS[m.rank];
  const RankIcon = rankData?.icon || Shield;
  const isTop = pos === 0;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
      borderRadius: 12, background: m.you ? `${CYAN}06` : isTop ? `${m.color}04` : "transparent",
      border: m.you ? `1px solid ${CYAN}15` : isTop ? `1px solid ${m.color}12` : `1px solid transparent`,
      opacity: 0, animation: `fi 0.4s ease ${index * 0.08}s forwards`,
      transition: "background 0.2s",
    }}
      onMouseEnter={e => { if (!m.you) e.currentTarget.style.background = `${m.color}06`; }}
      onMouseLeave={e => { if (!m.you) e.currentTarget.style.background = isTop ? `${m.color}04` : "transparent"; }}
    >
      {/* Position */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
        background: pos === 0 ? "#FBBF2415" : pos === 1 ? `${CYAN}10` : pos === 2 ? "#FB923C10" : "transparent",
        border: pos < 3 ? "none" : `1px solid ${BORDER}`,
      }}>
        {pos === 0 ? <Crown size={14} color="#FBBF24" /> :
         <span style={{ fontSize: 13, fontWeight: 600, fontFamily: mono, color: pos < 3 ? TEXT : MUTED }}>{pos + 1}</span>}
      </div>

      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: `${m.color}15`, border: `2px solid ${m.color}30`,
        boxShadow: isTop ? `0 0 15px ${m.color}15` : "none",
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.name[0]}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: BRIGHT }}>{m.name}</span>
          {m.you && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: `${CYAN}15`, color: CYAN }}>You</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 6,
            background: `${m.color}12`, color: m.color, fontFamily: ar, fontWeight: 500,
          }}>
            <RankIcon size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
            {m.rank}
          </span>
        </div>
      </div>

      {/* Streak */}
      <div style={{ textAlign: "center", minWidth: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
          <Flame size={13} color="#FB923C" />
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: mono, color: "#FB923C" }}>{m.streak}</span>
        </div>
        <span style={{ fontSize: 9, color: MUTED }}>streak</span>
      </div>

      {/* Trend */}
      <div style={{ textAlign: "center", minWidth: 40 }}>
        {m.trend === "up" && <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
          <ArrowUpRight size={12} color="#34D399" />
          <span style={{ fontSize: 11, fontFamily: mono, color: "#34D399" }}>+{m.delta}</span>
        </div>}
        {m.trend === "down" && <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
          <ArrowUpRight size={12} color="#F87171" style={{ transform: "rotate(90deg)" }} />
          <span style={{ fontSize: 11, fontFamily: mono, color: "#F87171" }}>{m.delta}</span>
        </div>}
        {m.trend === "same" && <span style={{ fontSize: 11, fontFamily: mono, color: MUTED }}>—</span>}
      </div>

      {/* Weekly Ring */}
      <MiniRing pct={m.ring} color={m.color} />
    </div>
  );
}

function DuaCard({ dua, index }) {
  const [prayed, setPrayed] = useState(false);
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10, background: BG,
      border: `1px solid ${BORDER}`,
      opacity: 0, animation: `fi 0.3s ease ${index * 0.08}s forwards`,
    }}>
      <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, margin: "0 0 10px", fontStyle: "italic" }}>
        "{dua.text}"
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Heart size={12} color={prayed ? "#F472B6" : MUTED} fill={prayed ? "#F472B6" : "none"} />
          <span style={{ fontSize: 11, color: MUTED }}>{prayed ? dua.count + 1 : dua.count} made du'a</span>
          <span style={{ fontSize: 10, color: "#1A3050" }}>{dua.timeAgo} ago</span>
        </div>
        <button onClick={() => setPrayed(!prayed)} style={{
          padding: "5px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer",
          background: prayed ? "#F472B615" : "transparent",
          border: `1px solid ${prayed ? "#F472B630" : BORDER}`,
          color: prayed ? "#F472B6" : MUTED,
          transition: "all 0.2s",
        }}>
          {prayed ? "Du'a made" : "I made du'a"}
        </button>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px" }}>
      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, color: BRIGHT }}>{payload[0].value}</span>
    </div>
  );
}

export default function SibaqSystem() {
  const [inviteVisible, setInviteVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [naseehaOpen, setNaseehaOpen] = useState(false);
  const [duaInput, setDuaInput] = useState("");

  const inviteCode = "XK7M2P";
  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const rankData = RANKS[MY_SCORE.rank];

  return (
    <div style={{
      minHeight: "100vh", background: BG, color: TEXT,
      fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px ${rankData.color}10; } 50% { box-shadow: 0 0 35px ${rankData.color}20; } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
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
            <Swords size={20} color="#F472B6" />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>السِباق</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Competition</span>
          </div>
          <div style={{ fontSize: 12, color: MUTED, fontFamily: ar }}>
            "فَاسْتَبِقُوا الْخَيْرَاتِ" — تنافس على الخير مع إخوانك
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setInviteVisible(!inviteVisible)} style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer",
            background: `${CYAN}10`, border: `1px solid ${CYAN}25`, color: CYAN,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <UserPlus size={13} /> Invite
          </button>
          <button style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer",
            background: CARD, border: `1px solid ${BORDER}`, color: MUTED,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Plus size={13} /> New Halaqah
          </button>
        </div>
      </div>

      {/* Invite Code Bar */}
      {inviteVisible && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
          borderRadius: 10, background: `${CYAN}06`, border: `1px solid ${CYAN}15`,
          marginBottom: 16, animation: "fi 0.3s ease",
        }}>
          <Lock size={14} color={CYAN} />
          <span style={{ fontSize: 12, color: MUTED }}>Share this code with friends to join your Halaqah:</span>
          <span style={{
            fontSize: 18, fontWeight: 700, fontFamily: mono, color: CYAN,
            padding: "4px 16px", borderRadius: 8, background: `${CYAN}10`, letterSpacing: "3px",
          }}>{inviteCode}</span>
          <button onClick={handleCopy} style={{
            padding: "6px 14px", borderRadius: 6, fontSize: 11, cursor: "pointer",
            background: copied ? "#34D39918" : "transparent", border: `1px solid ${copied ? "#34D39930" : BORDER}`,
            color: copied ? "#34D399" : MUTED, display: "flex", alignItems: "center", gap: 4,
          }}>
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
          <button onClick={() => setInviteVisible(false)} style={{
            marginLeft: "auto", background: "none", border: "none", cursor: "pointer",
          }}>
            <X size={14} color={MUTED} />
          </button>
        </div>
      )}

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 300px", gap: 16 }}>

        {/* ── LEFT: My Score ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* My Rank Card */}
          <Card glow={rankData.color} style={{ animation: "glow 4s ease infinite", textAlign: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px",
              borderRadius: 20, background: `${rankData.color}12`, border: `1px solid ${rankData.color}25`,
              marginBottom: 14,
            }}>
              <rankData.icon size={13} color={rankData.color} />
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: ar, color: rankData.color }}>{MY_SCORE.rank}</span>
            </div>

            <BigRing pct={MY_SCORE.weeklyRing} color={rankData.color} />

            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center" }}>
                  <Flame size={14} color="#FB923C" />
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: mono, color: "#FB923C" }}>{MY_SCORE.streak}</span>
                </div>
                <span style={{ fontSize: 9, color: MUTED }}>day streak</span>
              </div>
              <div style={{ width: 1, height: 30, background: BORDER }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center" }}>
                  <Zap size={14} color={CYAN} />
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: mono, color: CYAN }}>{MY_SCORE.total}</span>
                </div>
                <span style={{ fontSize: 9, color: MUTED }}>today's score</span>
              </div>
            </div>
          </Card>

          {/* Mini Chart */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <TrendingUp size={13} color="#60A5FA" />
              <span style={{ fontSize: 12, fontWeight: 600 }}>Your week</span>
            </div>
            <div style={{ height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEK_CHART} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={rankData.color} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={rankData.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#1A3050" }} />
                  <Tooltip content={<ChartTooltip />} cursor={false} />
                  <Area type="monotone" dataKey="s" stroke={rankData.color} strokeWidth={2} fill="url(#sbg)"
                    dot={{ r: 2.5, fill: rankData.color, stroke: BG, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Score Breakdown (PRIVATE) */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <EyeOff size={13} color={MUTED} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Your breakdown</span>
              </div>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: "#F8717108", color: "#F87171", border: "1px solid #F8717115" }}>
                <Lock size={8} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />Private
              </span>
            </div>
            {MY_SCORE.breakdown.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                <span style={{ flex: 1, fontSize: 11, color: MUTED }}>{s.label}</span>
                <div style={{ width: 80, height: 3, borderRadius: 2, background: "#0C2550", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(s.v / s.max) * 100}%`, borderRadius: 2, background: s.color }} />
                </div>
                <span style={{ fontSize: 10, fontFamily: mono, color: TEXT, width: 30, textAlign: "right" }}>{s.v}/{s.max}</span>
              </div>
            ))}
            <div style={{
              marginTop: 8, padding: "6px 10px", borderRadius: 6, background: `${rankData.color}06`,
              border: `1px solid ${rankData.color}10`, fontSize: 10, color: MUTED, textAlign: "center",
            }}>
              Only you see this. Friends see your rank, ring, and streak.
            </div>
          </Card>
        </div>

        {/* ── CENTER: Leaderboard ───────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Halaqah Header */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${CYAN}10`, border: `1px solid ${CYAN}20`,
                }}>
                  <Users size={20} color={CYAN} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>حلقة Software Engineers</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{MEMBERS.length} members · Created by Fathy</div>
                </div>
              </div>
              <Settings size={16} color={MUTED} style={{ cursor: "pointer" }} />
            </div>
          </Card>

          {/* Leaderboard */}
          <Card glow="#F472B6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Trophy size={15} color="#FBBF24" />
                <span style={{ fontSize: 14, fontWeight: 700, color: BRIGHT }}>Leaderboard</span>
              </div>
              <span style={{ fontSize: 10, color: MUTED, fontFamily: mono }}>This week</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {MEMBERS.sort((a, b) => b.ring - a.ring).map((m, i) => (
                <LeaderboardRow key={m.name} m={m} pos={i} index={i} />
              ))}
            </div>
            <div style={{
              marginTop: 12, padding: "8px 12px", borderRadius: 8, background: BG,
              border: `1px solid ${BORDER}`, fontSize: 10, color: MUTED, textAlign: "center",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Shield size={10} />
              No one sees what you scored. Only rank, streak, and weekly ring.
            </div>
          </Card>

          {/* Weekly Challenge */}
          <Card glow={CYAN}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Swords size={15} color={CYAN} />
              <span style={{ fontSize: 14, fontWeight: 700, color: BRIGHT }}>Weekly challenge</span>
              <span style={{
                fontSize: 9, padding: "2px 8px", borderRadius: 10, background: `${CYAN}10`,
                color: CYAN, fontFamily: mono, marginLeft: "auto",
              }}>Day {CHALLENGE.daysCompleted}/{CHALLENGE.daysTotal}</span>
            </div>

            <div style={{
              padding: "16px 20px", borderRadius: 12, background: BG,
              border: `1px solid ${BORDER}`, marginBottom: 12,
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: ar, color: BRIGHT, marginBottom: 4 }}>
                {CHALLENGE.titleAr}
              </div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>{CHALLENGE.title}</div>

              {/* Days Progress */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {Array.from({ length: CHALLENGE.daysTotal }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 8, borderRadius: 4,
                    background: i < CHALLENGE.daysCompleted ? CYAN : "#0C2550",
                    boxShadow: i < CHALLENGE.daysCompleted ? `0 0 6px ${CYAN}30` : "none",
                    transition: "all 0.3s",
                  }} />
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: MUTED }}>
                  <span style={{ fontFamily: mono, color: CYAN }}>{CHALLENGE.membersToday}/{CHALLENGE.membersTotal}</span> members completed today
                </span>
                <button style={{
                  padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: CYAN, border: "none", color: "#000E30",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Check size={13} /> Mark done
                </button>
              </div>
            </div>

            {/* Past Challenges */}
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>Previous challenges</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {PREV_CHALLENGES.map((ch, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                  borderRadius: 6, background: BG,
                }}>
                  {ch.completed ? <Check size={12} color="#34D399" /> : <X size={12} color="#F87171" />}
                  <span style={{ flex: 1, fontSize: 11, color: TEXT }}>{ch.title}</span>
                  <span style={{ fontSize: 10, fontFamily: mono, color: MUTED }}>{ch.participants}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── RIGHT: Du'a Wall + Naseeha ────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Du'a Wall */}
          <Card glow="#F472B6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Heart size={14} color="#F472B6" />
                <span style={{ fontSize: 14, fontWeight: 700, color: BRIGHT }}>Du'a wall</span>
              </div>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: "#F472B608", color: "#F472B6" }}>Anonymous</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DUAS.map((d, i) => <DuaCard key={i} dua={d} index={i} />)}
            </div>

            {/* Add Du'a */}
            <div style={{
              display: "flex", gap: 8, marginTop: 12, padding: "10px 12px",
              borderRadius: 10, background: BG, border: `1px solid ${BORDER}`,
            }}>
              <input
                value={duaInput} onChange={e => setDuaInput(e.target.value)}
                placeholder="Request a du'a (anonymous)..."
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: 12, color: TEXT, fontFamily: "inherit",
                }}
              />
              <button style={{
                width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                background: duaInput ? `${CYAN}15` : "transparent",
                border: `1px solid ${duaInput ? `${CYAN}30` : BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Send size={13} color={duaInput ? CYAN : MUTED} />
              </button>
            </div>
          </Card>

          {/* Naseeha */}
          <Card glow="#34D399">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <MessageSquare size={14} color="#34D399" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Naseeha</span>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: "#34D39908", color: "#34D399" }}>Anonymous</span>
            </div>

            <div style={{
              padding: "12px 14px", borderRadius: 10, background: BG,
              border: `1px solid ${BORDER}`, marginBottom: 10,
            }}>
              <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>A brother needs encouragement</div>
              <p style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, margin: "0 0 10px" }}>
                Someone in your Halaqah has been less active for 3 days. Send them anonymous encouragement.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[
                  "Keep going!",
                  "Allah sees your effort",
                  "Even small deeds count",
                  "We're all human",
                ].map(msg => (
                  <button key={msg} style={{
                    padding: "6px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                    background: "transparent", border: `1px solid #34D39925`, color: "#34D399",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#34D39910"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >{msg}</button>
                ))}
              </div>
            </div>

            {/* Received Naseeha */}
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Received</div>
            <div style={{
              padding: "10px 14px", borderRadius: 8, background: BG, border: `1px solid ${BORDER}`,
              fontSize: 12, color: TEXT, fontStyle: "italic",
            }}>
              "Keep going brother! Your consistency inspires us all."
              <div style={{ fontSize: 10, color: MUTED, fontStyle: "normal", marginTop: 4 }}>From anonymous · 1d ago</div>
            </div>
          </Card>

          {/* Privacy Reminder */}
          <Card style={{
            background: `linear-gradient(135deg, ${CYAN}06, transparent)`,
            border: `1px solid ${CYAN}10`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Shield size={14} color={CYAN} />
              <span style={{ fontSize: 12, fontWeight: 600, color: CYAN }}>Privacy</span>
            </div>
            <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
              Your worship details are between you and Allah. Friends only see your rank, streak, and weekly ring. No one knows which prayers you prayed or how many pages you read.
            </div>
            <div style={{
              marginTop: 10, padding: "8px", borderRadius: 6, background: BG,
              fontSize: 10, color: "#3D5A80", textAlign: "center", fontFamily: ar,
            }}>
              "إن الله يحب العبد التقي النقي الخفي"
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
