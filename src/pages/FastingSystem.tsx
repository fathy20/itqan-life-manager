import { useState } from "react";
import {
  Moon, CheckCircle2, Circle, ChevronLeft, ChevronRight,
  RefreshCw, AlertCircle, ArrowRight, Lightbulb,
} from "lucide-react";
import { useFastingNew } from "../hooks/useFastingNew";
import type { FastingType } from "../types/new";

const BG    = "#000E30";
const CARD  = "#071A3A";
const BORDER = "#0C2550";
const TEXT  = "#C0C8D8";
const MUTED = "#3D5A80";
const BRIGHT = "#E8EBF0";
const CYAN  = "#08A7E7";
const GOLD  = "#FBBF24";
const GREEN = "#34D399";
const ROSE  = "#FB7185";
const mono  = "'JetBrains Mono', monospace";
const ar    = "'Noto Kufi Arabic', sans-serif";

const FASTING_TYPES: { value: FastingType; label: string }[] = [
  { value: "monday_thursday", label: "الاثنين والخميس" },
  { value: "ayyam_beed",      label: "أيام البيض" },
  { value: "arafah",          label: "يوم عرفة" },
  { value: "ashura",          label: "عاشوراء" },
  { value: "shawwal",         label: "ستة شوال" },
  { value: "qada",            label: "قضاء" },
  { value: "voluntary",       label: "تطوع" },
  { value: "ramadan",         label: "رمضان" },
];

const MONTH_NAMES_AR = [
  "", "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function Card({ children, style }: any) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

function Badge({ label, color = CYAN }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: 11, padding: "4px 10px", borderRadius: 999,
      background: `${color}15`, color, border: `1px solid ${color}30`, fontFamily: mono,
    }}>{label}</span>
  );
}

function SectionTitle({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <span style={{ fontSize: 14, fontWeight: 600, color: BRIGHT }}>{title}</span>
      </div>
      {badge}
    </div>
  );
}

export default function FastingSystem({ onBack }: { onBack?: () => void }) {
  const {
    days, qada, suggestions, loading, error,
    year, month, setMonth,
    logDay, updateDay, updateQada, refetch,
  } = useFastingNew();

  const [logDate,   setLogDate]   = useState(new Date().toISOString().slice(0, 10));
  const [logType,   setLogType]   = useState<FastingType>("monday_thursday");
  const [logNotes,  setLogNotes]  = useState("");
  const [qadaOwed,  setQadaOwed]  = useState<string>("");
  const [qadaDone,  setQadaDone]  = useState<string>("");

  const completedThisMonth = days.filter(d => d.completed).length;

  const prevMonth = () => {
    if (month === 1) setMonth(year - 1, 12);
    else setMonth(year, month - 1);
  };
  const nextMonth = () => {
    if (month === 12) setMonth(year + 1, 1);
    else setMonth(year, month + 1);
  };

  const handleLog = async () => {
    if (!logDate) return;
    await logDay(logDate, logType, true, logNotes.trim() || undefined);
    setLogNotes("");
  };

  const handleToggle = async (date: string, current: boolean) => {
    await updateDay(date, !current);
  };

  const handleSaveQada = async () => {
    const owed = parseInt(qadaOwed, 10);
    const done = parseInt(qadaDone, 10);
    if (isNaN(owed) || isNaN(done)) return;
    await updateQada(owed, done);
    setQadaOwed("");
    setQadaDone("");
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, padding: "24px 32px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700&family=Noto+Kufi+Arabic:wght@500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input, select, textarea { outline: none; }
        input::placeholder, textarea::placeholder { color: ${MUTED}; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{
              width: 36, height: 36, borderRadius: 10, background: BG, border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center", color: TEXT, cursor: "pointer",
            }}>
              <ArrowRight size={16} />
            </button>
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Moon size={20} color={CYAN} />
              <span style={{ fontFamily: ar, fontSize: 22, fontWeight: 700, color: BRIGHT }}>الصيام</span>
              <span style={{ fontSize: 13, color: MUTED }}>Fasting Tracker</span>
            </div>
            <div style={{ fontSize: 12, color: MUTED }}>تتبع الصيام، القضاء، والأنواع النافلة</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {loading && <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} color={CYAN} />}
          <button onClick={() => refetch()} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10,
            background: BG, border: `1px solid ${BORDER}`, color: TEXT, cursor: "pointer",
          }}>
            <RefreshCw size={14} />
            <span style={{ fontSize: 12 }}>تحديث</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: "#2d1b1b", border: "1px solid #6b1d1d", color: "#fca5a5", display: "flex", gap: 8 }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: 13 }}>{error}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Month browser */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <button onClick={prevMonth} style={{ background: "transparent", border: "none", color: TEXT, cursor: "pointer" }}>
                <ChevronRight size={18} />
              </button>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: BRIGHT, fontFamily: ar }}>
                  {MONTH_NAMES_AR[month]} {year}
                </div>
                <Badge label={`${completedThisMonth} يوم مكتمل`} color={GREEN} />
              </div>
              <button onClick={nextMonth} style={{ background: "transparent", border: "none", color: TEXT, cursor: "pointer" }}>
                <ChevronLeft size={18} />
              </button>
            </div>

            {/* Day list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {days.length === 0 && !loading && (
                <div style={{ fontSize: 12, color: MUTED }}>لا توجد أيام مسجلة لهذا الشهر.</div>
              )}
              {days.map(d => {
                const typeLabel = FASTING_TYPES.find(t => t.value === d.type)?.label ?? d.type;
                return (
                  <div key={d.date} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: BG,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => handleToggle(d.date, d.completed)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                        {d.completed
                          ? <CheckCircle2 size={18} color={GREEN} />
                          : <Circle size={18} color={MUTED} />}
                      </button>
                      <div>
                        <div style={{ fontSize: 13, color: BRIGHT, fontWeight: 600 }}>{d.date}</div>
                        <div style={{ fontSize: 11, color: MUTED }}>{typeLabel}</div>
                      </div>
                    </div>
                    {d.notes && <div style={{ fontSize: 11, color: MUTED, maxWidth: 120, textAlign: "left" }}>{d.notes}</div>}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Log a fast */}
          <Card>
            <SectionTitle icon={<Moon size={15} color={CYAN} />} title="تسجيل يوم صيام" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>التاريخ</div>
                  <input
                    type="date" value={logDate} onChange={e => setLogDate(e.target.value)}
                    style={{ width: "100%", background: BG, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 13 }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>النوع</div>
                  <select
                    value={logType} onChange={e => setLogType(e.target.value as FastingType)}
                    style={{ width: "100%", background: BG, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 13 }}
                  >
                    {FASTING_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                value={logNotes} onChange={e => setLogNotes(e.target.value)}
                rows={2} placeholder="ملاحظة (اختياري)"
                style={{ width: "100%", background: BG, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, resize: "vertical" }}
              />
              <button onClick={handleLog} disabled={!logDate} style={{
                padding: "10px 14px", borderRadius: 10, background: `${GREEN}20`,
                border: `1px solid ${GREEN}40`, color: GREEN, fontWeight: 700,
                cursor: logDate ? "pointer" : "not-allowed",
              }}>
                <CheckCircle2 size={14} style={{ marginInlineEnd: 6 }} />
                تسجيل مكتمل
              </button>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Qada tracker */}
          <Card>
            <SectionTitle
              icon={<Moon size={15} color={GOLD} />}
              title="متابعة القضاء"
              badge={qada ? <Badge label={`${qada.remaining} متبقي`} color={ROSE} /> : undefined}
            />
            {qada && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "المطلوب", value: qada.totalOwed, color: ROSE },
                  { label: "المكتمل", value: qada.completed, color: GREEN },
                  { label: "المتبقي",  value: qada.remaining, color: GOLD },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: MUTED }}>{s.label}</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: mono }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>إجمالي المطلوب</div>
                <input
                  type="number" min={0} value={qadaOwed} onChange={e => setQadaOwed(e.target.value)}
                  placeholder={qada ? String(qada.totalOwed) : "0"}
                  style={{ width: "100%", background: BG, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 13 }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>المكتمل</div>
                <input
                  type="number" min={0} value={qadaDone} onChange={e => setQadaDone(e.target.value)}
                  placeholder={qada ? String(qada.completed) : "0"}
                  style={{ width: "100%", background: BG, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 13 }}
                />
              </div>
            </div>
            <button onClick={handleSaveQada} disabled={!qadaOwed && !qadaDone} style={{
              marginTop: 10, width: "100%", padding: "10px 14px", borderRadius: 10,
              background: `${CYAN}15`, border: `1px solid ${CYAN}35`, color: CYAN,
              fontWeight: 700, cursor: "pointer",
            }}>
              حفظ القضاء
            </button>
          </Card>

          {/* Suggestions */}
          <Card>
            <SectionTitle icon={<Lightbulb size={15} color={GOLD} />} title="اقتراحات" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {suggestions.length === 0 && (
                <div style={{ fontSize: 12, color: MUTED }}>لا توجد اقتراحات حالياً.</div>
              )}
              {suggestions.map((s, i) => (
                <div key={i} style={{
                  padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: BG, fontSize: 13, color: TEXT, fontFamily: ar, lineHeight: 1.6,
                }}>
                  {s}
                </div>
              ))}
            </div>
          </Card>

          {/* Monthly summary */}
          <Card>
            <SectionTitle
              icon={<Moon size={15} color={CYAN} />}
              title="ملخص الشهر"
              badge={<Badge label={`${MONTH_NAMES_AR[month]} ${year}`} />}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "إجمالي الأيام", value: days.length, color: BRIGHT },
                { label: "مكتمل",        value: completedThisMonth, color: GREEN },
                { label: "غير مكتمل",   value: days.filter(d => !d.completed).length, color: MUTED },
                { label: "معدل الإتمام", value: days.length ? `${Math.round(completedThisMonth / days.length * 100)}%` : "—", color: CYAN },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: MUTED }}>{s.label}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: mono }}>{s.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
