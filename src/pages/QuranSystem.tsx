import { useState, useEffect } from "react";
import {
  BookOpen, Brain, CheckCircle2, Circle, Clock, ChevronRight,
  Target, Star, Calendar, BarChart3, TrendingUp, Play,
  Plus, Minus, Award, Bookmark, Layers, RotateCcw, AlertTriangle,
  ChevronDown, ChevronUp, Flame, Zap, Eye, Settings
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { useQuran } from '../hooks/useQuran';

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";
const GREEN = "#34D399";

const WEEK_PAGES = [
  { day: "سبت", pages: 6 }, { day: "أحد", pages: 4 }, { day: "اثنين", pages: 8 },
  { day: "ثلاثاء", pages: 3 }, { day: "أربعاء", pages: 5 }, { day: "خميس", pages: 4 }, { day: "جمعة", pages: 7 },
];

function Card({ children, style, glow }) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", position: "relative", overflow: "hidden", ...style }}>
      {glow && <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: glow, opacity: 0.04, filter: "blur(30px)", pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px" }}>
      <div style={{ fontSize: 10, color: MUTED, fontFamily: ar }}>{payload[0].payload.day}</div>
      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, color: GREEN }}>{payload[0].value} pages</div>
    </div>
  );
}

export default function QuranSystem() {
  const [logPages, setLogPages] = useState(0);
  const { activePlan, hifz, reviewsDue, stats, loading, logSession, updateHifz } = useQuran();
  const KHATMA = activePlan ? {
    currentPage: activePlan.currentPage || 1,
    totalPages: activePlan.totalPages || 604,
    dailyTarget: activePlan.dailyPages || 4,
    todayRead: 0,
    daysLeft: Math.ceil((new Date(activePlan.targetDate).getTime() - Date.now()) / 86400000),
    plan: `${activePlan.targetDays}-day`
  } : { currentPage: 0, totalPages: 604, dailyTarget: 4, todayRead: 0, daysLeft: 0, plan: '30-day' };
  const HIFZ = hifz;
  const reviewsDueToday = reviewsDue;

  const JUZ_DATA = Array.from({ length: 30 }, (_, i) => ({
    num: i + 1, pct: i < 19 ? 100 : i === 19 ? 45 : 0,
  }));

  const kPct = Math.round((KHATMA.currentPage / KHATMA.totalPages) * 100);
  const todayLeft = KHATMA.dailyTarget - KHATMA.todayRead;
  const totalMem = HIFZ.filter((s: any) => s.status === "memorized").length;
  const reviewsDueCount = reviewsDueToday.length;
  const weekTotal = WEEK_PAGES.reduce((a, b) => a + b.pages, 0);

  const statusColors = { memorized: GREEN, in_progress: "#FBBF24", needs_review: "#F87171", not_started: "#1A3050" };
  const statusLabels = { memorized: "Memorized", in_progress: "In progress", needs_review: "Needs review", not_started: "Not started" };

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
            <BookOpen size={20} color={GREEN} />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>القرآن الكريم</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Quran Tracker</span>
          </div>
          <div style={{ fontSize: 12, color: MUTED }}>Reading, memorization, and review tracking</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: `${GREEN}10`, border: `1px solid ${GREEN}25`, color: GREEN, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={13} /> Log reading
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        <Card glow={GREEN}>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Khatma progress</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: mono, color: GREEN }}>{kPct}%</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Page {KHATMA.currentPage}/{KHATMA.totalPages}</div>
          <div style={{ height: 4, borderRadius: 2, background: "#0C2550", marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${kPct}%`, borderRadius: 2, background: `linear-gradient(90deg, ${GREEN}, #059669)`, boxShadow: `0 0 8px ${GREEN}30` }} />
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Today's target</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: mono, color: todayLeft > 0 ? "#FBBF24" : GREEN }}>{KHATMA.todayRead}</span>
            <span style={{ fontSize: 16, color: "#1A3050", fontFamily: mono }}>/{KHATMA.dailyTarget}</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{todayLeft > 0 ? `${todayLeft} pages left today` : "Target complete!"}</div>
        </Card>

        <Card>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Surahs memorized</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: mono, color: "#A78BFA" }}>{totalMem}</span>
            <span style={{ fontSize: 16, color: "#1A3050", fontFamily: mono }}>/{HIFZ.length}</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{HIFZ.filter(s => s.status === "in_progress").length} in progress</div>
        </Card>

        <Card glow={reviewsDueCount > 0 ? "#F87171" : GREEN}>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Reviews due</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: mono, color: reviewsDueCount > 0 ? "#F87171" : GREEN }}>{reviewsDueCount}</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{reviewsDueCount > 0 ? "Surahs need review today" : "All caught up!"}</div>
        </Card>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Juz Grid */}
          <Card glow={GREEN}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Layers size={14} color={GREEN} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Khatma — {KHATMA.plan} plan</span>
              </div>
              <span style={{ fontSize: 11, color: MUTED }}>{KHATMA.daysLeft} days left</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4, marginBottom: 14 }}>
              {JUZ_DATA.map(j => {
                const done = j.pct === 100; const cur = j.pct > 0 && j.pct < 100;
                return (
                  <div key={j.num} title={`Juz ${j.num} — ${j.pct}%`} style={{
                    aspectRatio: "1", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontFamily: mono, fontWeight: 600, cursor: "pointer", transition: "transform 0.15s",
                    background: done ? `${GREEN}20` : cur ? "#FBBF2420" : "#0C2550",
                    border: `1px solid ${done ? `${GREEN}35` : cur ? "#FBBF2435" : "#0C255080"}`,
                    color: done ? GREEN : cur ? "#FBBF24" : "#1A3050",
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >{j.num}</div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 10, color: MUTED }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: `${GREEN}20`, border: `1px solid ${GREEN}35` }} /> Completed</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#FBBF2420", border: "1px solid #FBBF2435" }} /> Current</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#0C2550" }} /> Remaining</div>
            </div>
          </Card>

          {/* Hifz Table */}
          <Card glow="#A78BFA">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Brain size={14} color="#A78BFA" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Hifz progress</span>
              </div>
              <button style={{ padding: "4px 12px", borderRadius: 6, fontSize: 10, cursor: "pointer", background: "#A78BFA10", border: "1px solid #A78BFA25", color: "#A78BFA" }}>
                <Plus size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} /> Add surah
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {HIFZ.map((s: any, i: number) => {
                const c = statusColors[s.status];
                const pct = Math.round((s.mem / s.ayahs) * 100);
                return (
                  <div key={s.num} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    borderRadius: 10, background: BG, border: `1px solid ${BORDER}`,
                    opacity: 0, animation: `fi 0.3s ease ${i * 0.05}s forwards`,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${c}12`, border: `1px solid ${c}25` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: mono, color: c }}>{s.num}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, fontFamily: ar, color: BRIGHT }}>{s.name}</span>
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: `${c}12`, color: c }}>{statusLabels[s.status]}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#0C2550", overflow: "hidden", maxWidth: 120 }}>
                          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: c }} />
                        </div>
                        <span style={{ fontSize: 10, fontFamily: mono, color: MUTED }}>{s.mem}/{s.ayahs}</span>
                      </div>
                    </div>
                    {s.review === "today" && (
                      <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: "#F8717112", color: "#F87171", border: "1px solid #F8717120" }}>
                        <RotateCcw size={9} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />Review today
                      </span>
                    )}
                    {s.review && s.review !== "today" && (
                      <span style={{ fontSize: 10, fontFamily: mono, color: MUTED }}>Review in {s.review}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Log Reading */}
          <Card glow={GREEN}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Bookmark size={14} color={GREEN} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Log reading session</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
              <button onClick={() => setLogPages(Math.max(0, logPages - 1))} style={{
                width: 44, height: 44, borderRadius: 10, cursor: "pointer", background: "transparent",
                border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center",
              }}><Minus size={18} color={MUTED} /></button>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 48, fontWeight: 700, fontFamily: mono, color: GREEN }}>{logPages}</span>
                <div style={{ fontSize: 11, color: MUTED }}>pages</div>
              </div>
              <button onClick={() => setLogPages(logPages + 1)} style={{
                width: 44, height: 44, borderRadius: 10, cursor: "pointer", background: `${GREEN}10`,
                border: `1px solid ${GREEN}25`, display: "flex", alignItems: "center", justifyContent: "center",
              }}><Plus size={18} color={GREEN} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
              {["Reading", "Hifz", "Review"].map(t => (
                <button key={t} style={{
                  padding: "8px", borderRadius: 8, fontSize: 12, cursor: "pointer", textAlign: "center",
                  background: t === "Reading" ? `${GREEN}10` : "transparent",
                  border: `1px solid ${t === "Reading" ? `${GREEN}25` : BORDER}`,
                  color: t === "Reading" ? GREEN : MUTED,
                }}>{t}</button>
              ))}
            </div>
            <button style={{
              width: "100%", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: logPages > 0 ? "pointer" : "default", background: logPages > 0 ? GREEN : "#0C2550",
              border: "none", color: logPages > 0 ? "#000E30" : "#1A3050", transition: "all 0.2s",
            }}
              onClick={() => logPages > 0 && logSession({ type: 'reading', fromPage: KHATMA.currentPage, toPage: KHATMA.currentPage + logPages, date: new Date().toISOString().split('T')[0] })}
            >
              <CheckCircle2 size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
              Log {logPages} pages
            </button>
          </Card>

          {/* Weekly Chart */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={14} color="#60A5FA" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Pages this week</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: mono, color: "#60A5FA" }}>{weekTotal} total</span>
            </div>
            <div style={{ height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEK_PAGES}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: ar }} />
                  <Tooltip content={<BarTooltip />} cursor={false} />
                  <Bar dataKey="pages" fill={GREEN} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Reviews Due */}
          {reviewsDueToday.length > 0 && (
            <Card glow="#F87171">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={14} color="#F87171" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F87171" }}>Reviews due today</span>
              </div>
              {reviewsDueToday.map((s: any) => (
                <div key={s.num} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, marginBottom: 6,
                }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, fontFamily: ar, color: BRIGHT }}>{s.name}</span>
                    <span style={{ fontSize: 10, color: MUTED, marginLeft: 8 }}>{s.ayahs} ayahs</span>
                  </div>
                  <button style={{
                    padding: "6px 14px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                    background: "#A78BFA10", border: "1px solid #A78BFA25", color: "#A78BFA",
                  }}>
                    <RotateCcw size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Start review
                  </button>
                </div>
              ))}
            </Card>
          )}

          {/* Quran Score */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={14} color={GREEN} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Quran score</span>
              </div>
              <span style={{ fontSize: 14, fontFamily: mono, fontWeight: 700, color: GREEN }}>17/20</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { l: "Daily target met", v: "partial", pts: "10", c: "#FBBF24" },
                { l: "Hifz session", v: "1 session", pts: "3", c: "#A78BFA" },
                { l: "Review session", v: "1 done", pts: "2", c: "#60A5FA" },
                { l: "Bonus", v: "khatma 65%", pts: "2", c: GREEN },
              ].map(s => (
                <div key={s.l} style={{ padding: "8px 12px", borderRadius: 8, background: BG, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
