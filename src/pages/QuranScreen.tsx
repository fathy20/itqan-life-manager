/**
 * QuranScreen — NEW (Quran vertical slice, Phase 1)
 * Source: interface/itqan-quran.jsx
 * Connected to: useQuranNew + quran-adapter
 * Mock data: REMOVED
 */
import { useState } from "react";
import {
  BookOpen, Brain, CheckCircle2, Plus, Minus, Award,
  Bookmark, Layers, RotateCcw, AlertTriangle, BarChart3,
  ChevronLeft,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { useQuranNew } from "../hooks/useQuranNew";
import {
  buildKhatma, buildJuzData, buildHifzList,
  buildWeekData, buildTopStats,
} from "../lib/quran-adapter";

const mono = "'JetBrains Mono', monospace";
const ar   = "'Noto Kufi Arabic', sans-serif";
const BG     = "#000E30";
const CARD   = "#071A3A";
const BORDER = "#0C2550";
const MUTED  = "#3D5A80";
const TEXT   = "#C0C8D8";
const BRIGHT = "#E8EBF0";
const GREEN  = "#34D399";

// ── Sub-components ────────────────────────────────────────────

function Card({ children, style, glow }: any) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", position: "relative", overflow: "hidden", ...style }}>
      {glow && <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: glow, opacity: 0.04, filter: "blur(30px)", pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function BarTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px" }}>
      <div style={{ fontSize: 10, color: MUTED, fontFamily: ar }}>{payload[0].payload.day}</div>
      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, color: GREEN }}>{payload[0].value} pages</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function QuranScreen({ onBack }: { onBack?: () => void }) {
  const { activePlan, hifz, reviewsDue, stats, todayPages, loading, logSession } = useQuranNew();

  const [logPages,    setLogPages]    = useState(0);
  const [sessionType, setSessionType] = useState<'reading' | 'hifz' | 'review'>('reading');
  const [logging,     setLogging]     = useState(false);

  // Build UI data from live hook data
  const khatma   = buildKhatma(activePlan, todayPages);
  const juzData  = buildJuzData(khatma.currentPage);
  const hifzList = buildHifzList(hifz);
  const weekData = buildWeekData(stats.weeklyPages);
  const topStats = buildTopStats(khatma, stats, hifz.length);

  const statusColors: Record<string, string> = {
    memorized:    GREEN,
    in_progress:  "#FBBF24",
    needs_review: "#F87171",
    not_started:  "#1A3050",
  };
  const statusLabels: Record<string, string> = {
    memorized:    "Memorized",
    in_progress:  "In progress",
    needs_review: "Needs review",
    not_started:  "Not started",
  };

  const handleLog = async () => {
    if (logPages <= 0 || logging) return;
    setLogging(true);
    await logSession({ type: sessionType, pages: logPages });
    setLogPages(0);
    setLogging(false);
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {onBack && (
            <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronLeft size={18} color={MUTED} />
            </button>
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <BookOpen size={20} color={GREEN} />
              <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>القرآن الكريم</span>
              <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Quran Tracker</span>
              {loading && <span style={{ fontSize: 10, color: MUTED, fontFamily: mono }}>loading...</span>}
            </div>
            <div style={{ fontSize: 12, color: MUTED }}>Reading, memorization, and review tracking</div>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        <Card glow={GREEN}>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Khatma progress</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: mono, color: GREEN }}>{topStats.khatmaPct}%</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Page {khatma.currentPage}/{khatma.totalPages}</div>
          <div style={{ height: 4, borderRadius: 2, background: "#0C2550", marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${topStats.khatmaPct}%`, borderRadius: 2, background: `linear-gradient(90deg, ${GREEN}, #059669)`, boxShadow: `0 0 8px ${GREEN}30` }} />
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Today's target</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: mono, color: topStats.todayRead < topStats.dailyTarget ? "#FBBF24" : GREEN }}>
              {topStats.todayRead}
            </span>
            <span style={{ fontSize: 16, color: "#1A3050", fontFamily: mono }}>/{topStats.dailyTarget}</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {topStats.todayRead < topStats.dailyTarget
              ? `${topStats.dailyTarget - topStats.todayRead} pages left today`
              : "Target complete!"}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Surahs memorized</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: mono, color: "#A78BFA" }}>{topStats.totalMemorized}</span>
            <span style={{ fontSize: 16, color: "#1A3050", fontFamily: mono }}>/{topStats.hifzTotal || '—'}</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {hifzList.filter(s => s.status === "in_progress").length} in progress
          </div>
        </Card>

        <Card glow={topStats.reviewsDue > 0 ? "#F87171" : GREEN}>
          <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Reviews due</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: mono, color: topStats.reviewsDue > 0 ? "#F87171" : GREEN }}>
              {topStats.reviewsDue}
            </span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {topStats.reviewsDue > 0 ? "Surahs need review today" : "All caught up!"}
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>

        {/* LEFT: Juz Grid + Hifz */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Juz Grid */}
          <Card glow={GREEN}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Layers size={14} color={GREEN} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Khatma — {khatma.plan} plan</span>
              </div>
              <span style={{ fontSize: 11, color: MUTED }}>{khatma.daysLeft} days left</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4, marginBottom: 14 }}>
              {juzData.map(j => {
                const done = j.pct === 100;
                const cur  = j.pct > 0 && j.pct < 100;
                return (
                  <div key={j.num} title={`Juz ${j.num} — ${j.pct}%`} style={{
                    aspectRatio: "1", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontFamily: mono, fontWeight: 600, cursor: "pointer", transition: "transform 0.15s",
                    background: done ? `${GREEN}20` : cur ? "#FBBF2420" : "#0C2550",
                    border: `1px solid ${done ? `${GREEN}35` : cur ? "#FBBF2435" : "#0C255080"}`,
                    color: done ? GREEN : cur ? "#FBBF24" : "#1A3050",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
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
            </div>

            {hifzList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: MUTED, fontSize: 12 }}>
                No hifz data yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {hifzList.map((s, i) => {
                  const c = statusColors[s.status] ?? MUTED;
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
                            <div style={{ height: "100%", width: `${s.pct}%`, borderRadius: 2, background: c }} />
                          </div>
                          <span style={{ fontSize: 10, fontFamily: mono, color: MUTED }}>{s.mem}/{s.ayahs}</span>
                        </div>
                      </div>
                      {s.reviewLabel === "today" && (
                        <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: "#F8717112", color: "#F87171", border: "1px solid #F8717120" }}>
                          <RotateCcw size={9} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />Review today
                        </span>
                      )}
                      {s.reviewLabel && s.reviewLabel !== "today" && (
                        <span style={{ fontSize: 10, fontFamily: mono, color: MUTED }}>Review in {s.reviewLabel}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: Log + Chart + Reviews + Score */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Log Reading */}
          <Card glow={GREEN}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Bookmark size={14} color={GREEN} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Log reading session</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
              <button onClick={() => setLogPages(Math.max(0, logPages - 1))} style={{ width: 44, height: 44, borderRadius: 10, cursor: "pointer", background: "transparent", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Minus size={18} color={MUTED} />
              </button>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 48, fontWeight: 700, fontFamily: mono, color: GREEN }}>{logPages}</span>
                <div style={{ fontSize: 11, color: MUTED }}>pages</div>
              </div>
              <button onClick={() => setLogPages(logPages + 1)} style={{ width: 44, height: 44, borderRadius: 10, cursor: "pointer", background: `${GREEN}10`, border: `1px solid ${GREEN}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={18} color={GREEN} />
              </button>
            </div>

            {/* Session type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
              {(['Reading', 'Hifz', 'Review'] as const).map(t => {
                const val = t.toLowerCase() as 'reading' | 'hifz' | 'review';
                return (
                  <button key={t} onClick={() => setSessionType(val)} style={{
                    padding: "8px", borderRadius: 8, fontSize: 12, cursor: "pointer", textAlign: "center",
                    background: sessionType === val ? `${GREEN}10` : "transparent",
                    border: `1px solid ${sessionType === val ? `${GREEN}25` : BORDER}`,
                    color: sessionType === val ? GREEN : MUTED,
                  }}>{t}</button>
                );
              })}
            </div>

            <button onClick={handleLog} disabled={logPages === 0 || logging} style={{
              width: "100%", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: logPages > 0 && !logging ? "pointer" : "default",
              background: logPages > 0 && !logging ? GREEN : "#0C2550",
              border: "none", color: logPages > 0 && !logging ? "#000E30" : "#1A3050", transition: "all 0.2s",
            }}>
              <CheckCircle2 size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
              {logging ? "Saving..." : `Log ${logPages} pages`}
            </button>
          </Card>

          {/* Weekly Chart */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={14} color="#60A5FA" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Pages this week</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: mono, color: "#60A5FA" }}>{stats.weeklyPages} total</span>
            </div>
            <div style={{ height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: ar }} />
                  <Tooltip content={<BarTooltip />} cursor={false} />
                  <Bar dataKey="pages" fill={GREEN} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Reviews Due */}
          {reviewsDue.length > 0 && (
            <Card glow="#F87171">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={14} color="#F87171" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F87171" }}>Reviews due today</span>
              </div>
              {reviewsDue.map(s => (
                <div key={s.surahNumber} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, fontFamily: ar, color: BRIGHT }}>{s.surahName || `Surah ${s.surahNumber}`}</span>
                    <span style={{ fontSize: 10, color: MUTED, marginLeft: 8 }}>{s.totalAyahs} ayahs</span>
                  </div>
                  <button style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: "#A78BFA10", border: "1px solid #A78BFA25", color: "#A78BFA" }}>
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
              <span style={{ fontSize: 14, fontFamily: mono, fontWeight: 700, color: GREEN }}>—/20</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { l: "Daily target", v: topStats.todayRead >= topStats.dailyTarget ? "met" : "partial", pts: topStats.todayRead >= topStats.dailyTarget ? "10" : "0", c: topStats.todayRead >= topStats.dailyTarget ? GREEN : "#FBBF24" },
                { l: "Memorized",    v: `${topStats.totalMemorized} surahs`, pts: "—", c: "#A78BFA" },
                { l: "Reviews done", v: `${reviewsDue.length === 0 ? "all clear" : `${reviewsDue.length} pending`}`, pts: "—", c: "#60A5FA" },
                { l: "Weekly pages", v: `${stats.weeklyPages}`, pts: "—", c: GREEN },
              ].map(s => (
                <div key={s.l} style={{ padding: "8px 12px", borderRadius: 8, background: BG, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: MUTED }}>{s.l}</div>
                    <div style={{ fontSize: 11, fontFamily: mono, color: TEXT }}>{s.v}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: mono, color: s.c }}>{s.pts}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
