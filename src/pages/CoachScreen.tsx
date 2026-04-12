import { useState, useRef, useEffect } from "react";
import {
  Bot, Send, Trash2, CalendarDays, BarChart3,
  RefreshCw, AlertCircle, ArrowRight, Loader2,
  BookOpen, Briefcase, Heart, Moon, Sparkles,
} from "lucide-react";
import { useAINew } from "../hooks/useAINew";
import type { DayPlanBlock } from "../lib/api/ai";

const BG     = "#000E30";
const CARD   = "#071A3A";
const BORDER = "#0C2550";
const TEXT   = "#C0C8D8";
const MUTED  = "#3D5A80";
const BRIGHT = "#E8EBF0";
const CYAN   = "#08A7E7";
const GOLD   = "#FBBF24";
const GREEN  = "#34D399";
const PURPLE = "#A78BFA";
const mono   = "'JetBrains Mono', monospace";
const ar     = "'Noto Kufi Arabic', sans-serif";

type Tab = "chat" | "planday" | "review";

const TYPE_COLORS: Record<string, string> = {
  study:   CYAN,
  work:    GOLD,
  health:  GREEN,
  worship: PURPLE,
};
const TYPE_ICONS: Record<string, any> = {
  study:   BookOpen,
  work:    Briefcase,
  health:  Heart,
  worship: Moon,
};

function Card({ children, style }: any) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

function PlanBlock({ block }: { block: DayPlanBlock }) {
  const color  = TYPE_COLORS[block.type] || CYAN;
  const Icon   = TYPE_ICONS[block.type]  || Sparkles;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "10px 12px", borderRadius: 10, border: `1px solid ${color}22`,
      background: `${color}08`,
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 52 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color, fontWeight: 700 }}>{block.time}</span>
        <Icon size={13} color={color} />
      </div>
      <span style={{ fontSize: 13, color: TEXT, fontFamily: ar, lineHeight: 1.5 }}>{block.task}</span>
    </div>
  );
}

export default function CoachScreen({ onBack }: { onBack?: () => void }) {
  const [tab,   setTab]   = useState<Tab>("chat");
  const [input, setInput] = useState("");
  const msgEnd = useRef<HTMLDivElement>(null);

  const {
    messages, planDay, weeklyReview,
    chatLoading, planLoading, reviewLoading, error,
    sendMessage, generatePlanDay, generateReview, clearChat, clearError,
  } = useAINew();

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const tabs: { id: Tab; label: string; en: string }[] = [
    { id: "chat",    label: "المحادثة",         en: "Chat"          },
    { id: "planday", label: "خطة اليوم",        en: "Plan Day"      },
    { id: "review",  label: "المراجعة الأسبوعية", en: "Weekly Review" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700&family=Noto+Kufi+Arabic:wght@500;600;700&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } textarea { outline: none; resize: none; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px", borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, background: BG, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: "transparent", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT, cursor: "pointer" }}>
              <ArrowRight size={16} />
            </button>
          )}
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${CYAN}15`, border: `1px solid ${CYAN}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={20} color={CYAN} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: ar, fontSize: 20, fontWeight: 700, color: BRIGHT }}>إتقان كوتش</span>
              <span style={{ fontSize: 12, color: MUTED, fontFamily: mono }}>AI Coach</span>
            </div>
            <div style={{ fontSize: 11, color: MUTED }}>مدرب حياة ذكي — متصل ببياناتك الفعلية</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "12px 24px 0", borderBottom: `1px solid ${BORDER}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); clearError(); }} style={{
            padding: "8px 18px", borderRadius: "8px 8px 0 0", cursor: "pointer", fontSize: 13,
            background: tab === t.id ? CARD : "transparent",
            border: `1px solid ${tab === t.id ? BORDER : "transparent"}`,
            borderBottom: tab === t.id ? `1px solid ${CARD}` : "none",
            color: tab === t.id ? BRIGHT : MUTED, fontFamily: ar,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ margin: "12px 24px 0", padding: "10px 14px", borderRadius: 10, background: "#2d1b1b", border: "1px solid #6b1d1d", color: "#fca5a5", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={15} />
          <span style={{ fontSize: 13 }}>{error}</span>
          <button onClick={clearError} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

      <div style={{ padding: "16px 24px" }}>

        {/* ── CHAT TAB ── */}
        {tab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)" }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
              {messages.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, opacity: 0.7 }}>
                  <Bot size={48} color={CYAN} strokeWidth={1.5} />
                  <div style={{ fontFamily: ar, fontSize: 16, color: MUTED }}>ابدأ محادثة مع الكوتش</div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: MUTED }}>اسأل عن مهامك، دراستك، أو خطتك اليوم</div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
                  {m.role === "coach" && (
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${CYAN}15`, border: `1px solid ${CYAN}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Bot size={16} color={CYAN} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: "70%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                    background: m.role === "user" ? `${CYAN}18` : CARD,
                    border: `1px solid ${m.role === "user" ? `${CYAN}30` : BORDER}`,
                    fontSize: 14, fontFamily: ar, lineHeight: 1.7, color: TEXT,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: `${CYAN}15`, border: `1px solid ${CYAN}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Bot size={16} color={CYAN} />
                  </div>
                  <div style={{ padding: "12px 16px", borderRadius: "4px 14px 14px 14px", background: CARD, border: `1px solid ${BORDER}`, display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: CYAN, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={msgEnd} />
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
              <button onClick={clearChat} title="مسح المحادثة" style={{ width: 40, height: 40, borderRadius: 10, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trash2 size={15} />
              </button>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={2}
                placeholder="اكتب رسالتك..."
                style={{ flex: 1, background: CARD, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 14px", fontSize: 14, fontFamily: ar, lineHeight: 1.6 }}
              />
              <button onClick={handleSend} disabled={!input.trim() || chatLoading} style={{
                width: 44, height: 44, borderRadius: 12, cursor: input.trim() && !chatLoading ? "pointer" : "not-allowed",
                background: input.trim() && !chatLoading ? `${CYAN}20` : `${MUTED}15`,
                border: `1px solid ${input.trim() && !chatLoading ? `${CYAN}40` : `${MUTED}25`}`,
                color: input.trim() && !chatLoading ? CYAN : MUTED,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {chatLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* ── PLAN DAY TAB ── */}
        {tab === "planday" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <CalendarDays size={18} color={GOLD} />
                  <span style={{ fontFamily: ar, fontSize: 18, fontWeight: 700, color: BRIGHT }}>خطة اليوم</span>
                </div>
                <div style={{ fontSize: 12, color: MUTED }}>خطة يومية ذكية مبنية على مهامك وامتحاناتك</div>
              </div>
              <button onClick={generatePlanDay} disabled={planLoading} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
                background: `${GOLD}15`, border: `1px solid ${GOLD}35`, color: GOLD,
                fontWeight: 700, cursor: planLoading ? "not-allowed" : "pointer", fontSize: 13, fontFamily: ar,
              }}>
                {planLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={16} />}
                {planLoading ? "جاري التوليد..." : "ولّد خطة اليوم"}
              </button>
            </div>

            {!planDay && !planLoading && (
              <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 24px", opacity: 0.7 }}>
                <CalendarDays size={40} color={MUTED} strokeWidth={1.5} />
                <div style={{ fontFamily: ar, color: MUTED }}>اضغط "ولّد خطة اليوم" للحصول على خطتك</div>
              </Card>
            )}

            {planDay && (
              <>
                {/* Motivational note */}
                <Card style={{ background: `${CYAN}0A`, border: `1px solid ${CYAN}25` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Sparkles size={16} color={CYAN} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 13, fontFamily: ar, color: TEXT, lineHeight: 1.6, marginBottom: 8 }}>{planDay.motivationalNote}</div>
                      <div style={{ fontSize: 12, color: MUTED }}><span style={{ color: GOLD }}>أولوية الدراسة:</span> {planDay.studyPriority}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}><span style={{ color: CYAN }}>نصيحة تركيز:</span> {planDay.focusTip}</div>
                    </div>
                  </div>
                </Card>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  {[
                    { label: "الصباح", en: "Morning", blocks: planDay.morning, color: GOLD },
                    { label: "الظهر", en: "Afternoon", blocks: planDay.afternoon, color: CYAN },
                    { label: "المساء", en: "Evening", blocks: planDay.evening, color: PURPLE },
                  ].map(period => (
                    <Card key={period.en}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: period.color }} />
                        <span style={{ fontFamily: ar, fontSize: 14, fontWeight: 700, color: period.color }}>{period.label}</span>
                        <span style={{ fontSize: 10, color: MUTED, fontFamily: mono }}>{period.en}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {period.blocks.map((b, i) => <PlanBlock key={i} block={b} />)}
                        {period.blocks.length === 0 && <div style={{ fontSize: 12, color: MUTED, fontFamily: ar }}>لا يوجد</div>}
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── WEEKLY REVIEW TAB ── */}
        {tab === "review" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <BarChart3 size={18} color={PURPLE} />
                  <span style={{ fontFamily: ar, fontSize: 18, fontWeight: 700, color: BRIGHT }}>المراجعة الأسبوعية</span>
                </div>
                <div style={{ fontSize: 12, color: MUTED }}>تحليل ذكي لأسبوعك وتوصيات للأسبوع القادم</div>
              </div>
              <button onClick={generateReview} disabled={reviewLoading} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
                background: `${PURPLE}15`, border: `1px solid ${PURPLE}35`, color: PURPLE,
                fontWeight: 700, cursor: reviewLoading ? "not-allowed" : "pointer", fontSize: 13, fontFamily: ar,
              }}>
                {reviewLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={16} />}
                {reviewLoading ? "جاري التحليل..." : "ابدأ المراجعة"}
              </button>
            </div>

            {!weeklyReview && !reviewLoading && (
              <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 24px", opacity: 0.7 }}>
                <BarChart3 size={40} color={MUTED} strokeWidth={1.5} />
                <div style={{ fontFamily: ar, color: MUTED }}>اضغط "ابدأ المراجعة" لتحليل أسبوعك</div>
              </Card>
            )}

            {weeklyReview && (
              <>
                {/* Score */}
                <Card style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke={BORDER} strokeWidth="8" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke={PURPLE} strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 34 * weeklyReview.weeklyScore / 100} ${2 * Math.PI * 34}`}
                        strokeLinecap="round" transform="rotate(-90 40 40)" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: PURPLE, fontFamily: mono }}>{weeklyReview.weeklyScore}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: MUTED, marginBottom: 4 }}>نقاط الأسبوع</div>
                    <div style={{ fontSize: 13, fontFamily: ar, color: TEXT, lineHeight: 1.6 }}>{weeklyReview.encouragement}</div>
                  </div>
                </Card>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Card>
                    <div style={{ fontSize: 12, color: GREEN, fontFamily: mono, marginBottom: 8 }}>أبرز إنجاز</div>
                    <div style={{ fontSize: 13, fontFamily: ar, color: TEXT, lineHeight: 1.6 }}>{weeklyReview.topAchievement}</div>
                  </Card>
                  <Card>
                    <div style={{ fontSize: 12, color: "#FB7185", fontFamily: mono, marginBottom: 8 }}>أكبر تحدٍّ</div>
                    <div style={{ fontSize: 13, fontFamily: ar, color: TEXT, lineHeight: 1.6 }}>{weeklyReview.biggestChallenge}</div>
                  </Card>
                </div>

                <Card>
                  <div style={{ fontSize: 12, color: CYAN, fontFamily: mono, marginBottom: 12 }}>توصيات الأسبوع القادم</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {weeklyReview.nextWeekRecommendations.map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, background: BG, border: `1px solid ${BORDER}` }}>
                        <span style={{ fontSize: 11, fontFamily: mono, color: CYAN, marginTop: 2, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                        <span style={{ fontSize: 13, fontFamily: ar, color: TEXT, lineHeight: 1.6 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
