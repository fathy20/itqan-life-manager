import {
  Brain, AlertTriangle, BookOpen, Wallet, Activity,
  ListTodo, RefreshCw, ArrowRight, Loader2, AlertCircle,
} from "lucide-react";
import { useIntelligenceNew } from "../hooks/useIntelligenceNew";
import type { ExamRisk, HabitEntry, TopPriority } from "../lib/api/intelligence";

const BG     = "#000E30";
const CARD   = "#071A3A";
const BORDER = "#0C2550";
const TEXT   = "#C0C8D8";
const MUTED  = "#3D5A80";
const BRIGHT = "#E8EBF0";
const CYAN   = "#08A7E7";
const GOLD   = "#FBBF24";
const GREEN  = "#34D399";
const ROSE   = "#FB7185";
const PURPLE = "#A78BFA";
const mono   = "'JetBrains Mono', monospace";
const ar     = "'Noto Kufi Arabic', sans-serif";

const RISK_COLOR = { safe: GREEN, warning: GOLD, danger: ROSE };
const BURNOUT_COLOR = { low: GREEN, medium: GOLD, high: ROSE };

function Card({ children, style }: any) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ icon, label, color = CYAN }: { icon: any; label: string; color?: string }) {
  const Icon = icon;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <Icon size={14} color={color} />
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: mono }}>{label}</span>
    </div>
  );
}

function ScoreRing({ score, color, size = 90 }: { score: number; color: string; size?: number }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${circ * score / 100} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: mono }}>{score}</span>
      </div>
    </div>
  );
}

function ExamRow({ exam }: { exam: ExamRisk }) {
  const color = RISK_COLOR[exam.risk];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: BG, border: `1px solid ${color}22` }}>
      <div>
        <div style={{ fontSize: 13, color: BRIGHT, fontWeight: 600, fontFamily: ar }}>{exam.name}</div>
        <div style={{ fontSize: 11, color: MUTED }}>{exam.dailyLoad} محاضرة/يوم</div>
      </div>
      <div style={{ textAlign: "left" }}>
        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: mono }}>
          {exam.risk}
        </span>
        <div style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 4 }}>{exam.daysLeft} يوم</div>
      </div>
    </div>
  );
}

function HabitRow({ habit }: { habit: HabitEntry }) {
  const pct = habit.rate7d;
  const color = pct >= 70 ? GREEN : pct >= 40 ? GOLD : ROSE;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: TEXT, fontFamily: ar }}>{habit.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: MUTED, fontFamily: mono }}>streak {habit.streak}</span>
          <span style={{ fontSize: 12, color, fontFamily: mono, fontWeight: 700 }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: BORDER, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function PriorityRow({ p, idx }: { p: TopPriority; idx: number }) {
  const COLORS: Record<string, string> = { exam: CYAN, task: GOLD, finance: ROSE, habit: GREEN };
  const color = COLORS[p.type] || PURPLE;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", borderRadius: 10, background: BG, border: `1px solid ${color}20` }}>
      <span style={{ fontSize: 13, fontFamily: mono, color, fontWeight: 700, minWidth: 22 }}>{String(idx + 1).padStart(2, "0")}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: BRIGHT, fontWeight: 600, fontFamily: ar, marginBottom: 4 }}>{p.title}</div>
        <div style={{ fontSize: 11, color: MUTED }}>{p.action}</div>
      </div>
      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `${color}15`, color, border: `1px solid ${color}25`, fontFamily: mono }}>{p.urgency}</span>
    </div>
  );
}

export default function IntelligenceScreen({ onBack }: { onBack?: () => void }) {
  const { report, loading, error, refetch } = useIntelligenceNew();

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 28px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700&family=Noto+Kufi+Arabic:wght@500;600;700&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: "transparent", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT, cursor: "pointer" }}>
              <ArrowRight size={16} />
            </button>
          )}
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${CYAN}15`, border: `1px solid ${CYAN}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={22} color={CYAN} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontFamily: ar, fontSize: 20, fontWeight: 700, color: BRIGHT }}>لوحة الذكاء</span>
              <span style={{ fontSize: 12, color: MUTED, fontFamily: mono }}>Intelligence</span>
            </div>
            <div style={{ fontSize: 11, color: MUTED }}>تحليل شامل لحياتك بناءً على بياناتك الفعلية</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {loading && <Loader2 size={18} color={CYAN} style={{ animation: "spin 1s linear infinite" }} />}
          <button onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, background: "transparent", border: `1px solid ${BORDER}`, color: TEXT, cursor: "pointer" }}>
            <RefreshCw size={14} />
            <span style={{ fontSize: 12 }}>تحديث</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: "#2d1b1b", border: "1px solid #6b1d1d", color: "#fca5a5", display: "flex", gap: 8, alignItems: "center" }}>
          <AlertCircle size={15} />
          <span style={{ fontSize: 13 }}>{error}</span>
        </div>
      )}

      {loading && !report && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12 }}>
          <Loader2 size={28} color={CYAN} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: MUTED, fontFamily: ar }}>جاري تحليل بياناتك...</span>
        </div>
      )}

      {report && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Top row: Life Score + Burnout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Life Score */}
            <Card style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ScoreRing score={report.lifeScore} color={report.lifeScore >= 70 ? GREEN : report.lifeScore >= 40 ? GOLD : ROSE} />
              <div>
                <div style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>نقاط الحياة</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: BRIGHT, fontFamily: mono }}>{report.lifeScore}<span style={{ fontSize: 13, color: MUTED }}>/100</span></div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>مبني على المهام، الدراسة، المالية، العادات</div>
              </div>
            </Card>

            {/* Burnout */}
            <Card>
              <SectionLabel icon={AlertTriangle} label="مؤشر الإرهاق" color={BURNOUT_COLOR[report.burnout.level]} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, padding: "6px 16px", borderRadius: 20,
                  background: `${BURNOUT_COLOR[report.burnout.level]}15`,
                  border: `1px solid ${BURNOUT_COLOR[report.burnout.level]}35`,
                  color: BURNOUT_COLOR[report.burnout.level], fontFamily: mono,
                }}>
                  {report.burnout.level === "low" ? "منخفض" : report.burnout.level === "medium" ? "متوسط" : "مرتفع"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {report.burnout.signals.length === 0
                  ? <span style={{ fontSize: 12, color: GREEN, fontFamily: ar }}>لا توجد إشارات تحذيرية</span>
                  : report.burnout.signals.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: ROSE, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: TEXT, fontFamily: ar }}>{s}</span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          {/* Middle row: Exam Risks + Finance */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
            <Card>
              <SectionLabel icon={BookOpen} label="مخاطر الامتحانات" color={CYAN} />
              {report.examRisks.length === 0
                ? <div style={{ fontSize: 12, color: MUTED, fontFamily: ar }}>لا توجد امتحانات قادمة مسجلة.</div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{report.examRisks.map((e, i) => <ExamRow key={i} exam={e} />)}</div>
              }
            </Card>

            <Card>
              <SectionLabel icon={Wallet} label="المخاطر المالية" color={GOLD} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <ScoreRing score={report.financeRisk.score} color={report.financeRisk.score >= 70 ? GREEN : report.financeRisk.score >= 40 ? GOLD : ROSE} size={72} />
                <div>
                  <div style={{ fontSize: 12, color: MUTED }}>نقاط الصحة المالية</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: BRIGHT, fontFamily: mono }}>{report.financeRisk.score}/100</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {report.financeRisk.alerts.length === 0
                  ? <span style={{ fontSize: 12, color: GREEN, fontFamily: ar }}>لا توجد تنبيهات مالية</span>
                  : report.financeRisk.alerts.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: ROSE, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: TEXT, fontFamily: ar }}>{a}</span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          {/* Bottom row: Habits + Priorities */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <SectionLabel icon={Activity} label={`اتساق العادات — ${report.habitConsistency.overall}%`} color={PURPLE} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {report.habitConsistency.habits.length === 0
                  ? <div style={{ fontSize: 12, color: MUTED, fontFamily: ar }}>لا توجد عادات مسجلة.</div>
                  : report.habitConsistency.habits.map((h, i) => <HabitRow key={i} habit={h} />)
                }
              </div>
            </Card>

            <Card>
              <SectionLabel icon={ListTodo} label="أولى أولوياتك الآن" color={ROSE} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {report.topPriorities.length === 0
                  ? <div style={{ fontSize: 12, color: MUTED, fontFamily: ar }}>لا توجد أولويات عاجلة.</div>
                  : report.topPriorities.map((p, i) => <PriorityRow key={i} p={p} idx={i} />)
                }
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
