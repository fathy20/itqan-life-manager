import { useEffect, useMemo, useState } from "react";
import {
  Star, Sun, Moon, CheckCircle2, RotateCcw,
  Minus, Clock, BarChart3, Loader2, AlertCircle,
  ArrowRight, RefreshCw
} from "lucide-react";
import { useAdhkarNew } from '../hooks/useAdhkarNew';

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";
const GOLD = "#FBBF24";
const AFTER_PRAYER_TARGET = 5;

type BlockId = 'morning' | 'evening' | 'sleep' | 'afterPrayer';

type AdhkarBlock = {
  id: BlockId;
  nameAr: string;
  nameEn: string;
  icon: any;
  color: string;
  time: string;
};

const ADHKAR_BLOCKS: AdhkarBlock[] = [
  { id: "morning", nameAr: "الأذكار الصباحية", nameEn: "Morning Adhkar", icon: Sun, color: GOLD, time: "بعد الفجر" },
  { id: "evening", nameAr: "أذكار المساء", nameEn: "Evening Adhkar", icon: Moon, color: "#A78BFA", time: "قبل المغرب" },
  { id: "sleep", nameAr: "أذكار النوم", nameEn: "Sleep Adhkar", icon: Moon, color: "#34D399", time: "قبل النوم" },
  { id: "afterPrayer", nameAr: "أذكار بعد الصلاة", nameEn: "After Prayer", icon: Star, color: "#60A5FA", time: "بعد كل صلاة" },
];

const COUNTERS = [
  { id: "istighfar", nameAr: "الاستغفار", nameEn: "Istighfar", target: 100, color: "#A78BFA", text: "أستغفر الله العظيم وأتوب إليه" },
  { id: "salawat", nameAr: "الصلاة على النبي", nameEn: "Salawat", target: 100, color: GOLD, text: "اللهم صل وسلم على نبينا محمد" },
  { id: "subhanallah", nameAr: "سبحان الله", nameEn: "SubhanAllah", target: 33, color: "#34D399", text: "سبحان الله" },
  { id: "alhamdulillah", nameAr: "الحمد لله", nameEn: "Alhamdulillah", target: 33, color: "#60A5FA", text: "الحمد لله" },
  { id: "allahuakbar", nameAr: "الله أكبر", nameEn: "Allahu Akbar", target: 33, color: "#FB923C", text: "الله أكبر" },
  { id: "bismillah", nameAr: "بسم الله", nameEn: "Bismillah", target: 20, color: "#F472B6", text: "بسم الله" },
];

function Card({ children, style, glow }: any) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", position: "relative", overflow: "hidden", ...style }}>
      {glow && <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: glow, opacity: 0.04, filter: "blur(30px)", pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

type CounterProps = {
  data: typeof COUNTERS[number];
  value: number;
  disabled?: boolean;
  onChange: (next: number) => Promise<void>;
};

function Counter({ data, value, onChange, disabled }: CounterProps) {
  const [count, setCount] = useState(value);

  useEffect(() => setCount(value), [value]);

  const update = async (next: number) => {
    const safe = Math.max(0, next);
    setCount(safe);
    try {
      await onChange(safe);
    } catch {
      setCount(value);
    }
  };

  const pct = Math.min((count / data.target) * 100, 100);
  const done = count >= data.target;

  return (
    <div style={{
      padding: "16px", borderRadius: 12, background: BG, border: `1px solid ${done ? `${data.color}30` : BORDER}`,
      transition: "all 0.3s", opacity: disabled ? 0.5 : 1
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
        <button disabled={disabled} onClick={() => update(count - 1)} style={{
          width: 40, height: 40, borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", background: "transparent",
          border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center",
        }}><Minus size={16} color={MUTED} /></button>

        <button disabled={disabled} onClick={() => update(count + 1)} style={{
          width: 64, height: 64, borderRadius: "50%", cursor: disabled ? "not-allowed" : "pointer",
          background: done ? `${data.color}15` : `${data.color}10`,
          border: `2px solid ${done ? `${data.color}40` : `${data.color}25`}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s", fontSize: 22, fontWeight: 700, fontFamily: mono, color: data.color,
        }}
        >
          {done ? <CheckCircle2 size={24} color={data.color} /> : "+1"}
        </button>

        <button disabled={disabled} onClick={() => update(0)} style={{
          width: 40, height: 40, borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", background: "transparent",
          border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center",
        }}><RotateCcw size={14} color={MUTED} /></button>
      </div>
    </div>
  );
}

function formatTime(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getCounterValue(log: ReturnType<typeof useAdhkarNew>["todayLog"], id: string) {
  if (!log) return 0;
  if (id === 'istighfar') return log.istighfar ?? 0;
  if (id === 'salawat') return log.salawat ?? 0;
  return log.customCounters?.[id] ?? 0;
}

export default function AdhkarSystem({ onBack }: { onBack?: () => void }) {
  const { todayLog, stats, loading, error, logBlock, updateCounter, refetch } = useAdhkarNew();

  const blocks = useMemo(() => {
    return ADHKAR_BLOCKS.map((b) => {
      const completed = (() => {
        if (!todayLog) return false;
        switch (b.id) {
          case 'morning': return todayLog.morning?.completed;
          case 'evening': return todayLog.evening?.completed;
          case 'sleep': return todayLog.sleep?.completed;
          case 'afterPrayer': return (todayLog.afterPrayer?.count || 0) >= AFTER_PRAYER_TARGET;
          default: return false;
        }
      })();

      const completedAt = (() => {
        if (!todayLog) return undefined;
        if (b.id === 'morning') return todayLog.morning?.completedAt;
        if (b.id === 'evening') return todayLog.evening?.completedAt;
        return undefined;
      })();

      const afterPrayerCount = b.id === 'afterPrayer' ? (todayLog?.afterPrayer?.count || 0) : undefined;

      return { ...b, done: !!completed, completedAt, afterPrayerCount };
    });
  }, [todayLog]);

  const normalizeRate = (value?: number) => {
    if (value === undefined || value === null) return 0;
    return value > 1 ? Math.min(value, 100) : Math.round(value * 100);
  };

  const completionRate = normalizeRate(stats?.completionRate);
  const streak = stats?.streak ?? 0;
  const morningRate = normalizeRate(stats?.morningRate);
  const eveningRate = normalizeRate(stats?.eveningRate);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Star size={20} color={GOLD} />
              <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>الأذكار والأدعية</span>
              <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Adhkar & Dua</span>
            </div>
            <div style={{ fontSize: 12, color: MUTED }}>متصلة بالبيانات الحية من الخادم</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {loading && <Loader2 size={18} color={CYAN} style={{ animation: 'spin 1s linear infinite' }} />}
          <button onClick={() => refetch()} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10,
            background: BG, border: `1px solid ${BORDER}`, color: TEXT, cursor: "pointer"
          }}>
            <RefreshCw size={14} />
            <span style={{ fontSize: 12 }}>تحديث</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: 16, padding: "12px 14px", borderRadius: 10,
          background: "#2d1b1b", border: "1px solid #6b1d1d", color: "#fca5a5",
          display: "flex", alignItems: "center", gap: 8
        }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: 13 }}>{error}</span>
        </div>
      )}

      {/* Adhkar Blocks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {blocks.map((b, i) => (
          <Card key={b.id} glow={b.done ? b.color : undefined} style={{
            cursor: "pointer", opacity: loading ? 0.7 : 1, animation: `fi 0.4s ease ${i * 0.06}s forwards`,
            borderColor: b.done ? `${b.color}30` : BORDER,
          }}
            onClick={() => !loading && logBlock(b.id)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: b.done ? `${b.color}18` : "#0C2550", border: `1px solid ${b.done ? `${b.color}30` : BORDER}`,
              }}>
                {b.done ? <CheckCircle2 size={18} color={b.color} /> : <b.icon size={18} color={MUTED} />}
              </div>
              {b.done && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: `${b.color}12`, color: b.color }}>تم</span>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: ar, color: b.done ? b.color : TEXT, marginBottom: 2 }}>{b.nameAr}</div>
            <div style={{ fontSize: 11, color: MUTED }}>{b.time}</div>
            {b.completedAt && <div style={{ fontSize: 10, fontFamily: mono, color: `${b.color}80`, marginTop: 4 }}>تم عند {formatTime(b.completedAt)}</div>}
            {b.afterPrayerCount !== undefined && (
              <div style={{ fontSize: 10, fontFamily: mono, color: `${b.color}80`, marginTop: 4 }}>{b.afterPrayerCount}/{AFTER_PRAYER_TARGET} صلوات</div>
            )}
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
                <BarChart3 size={14} color={GOLD} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>العدادات</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 10, color: MUTED, fontFamily: mono }}>اضغط لزيادة العد</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {COUNTERS.map((c) => (
                <Counter
                  key={c.id}
                  data={c}
                  value={getCounterValue(todayLog, c.id)}
                  onChange={(next) => updateCounter(c.id, next)}
                  disabled={loading}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT - Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Weekly Consistency */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Clock size={14} color={CYAN} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>اتساق هذا الأسبوع</span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
              <div style={{ flex: 1, height: 8, borderRadius: 6, background: "#0C2550", overflow: "hidden" }}>
                <div style={{ width: `${completionRate}%`, height: "100%", background: CYAN, transition: "width 0.3s", boxShadow: `0 0 10px ${CYAN}40` }} />
              </div>
              <span style={{ fontSize: 12, fontFamily: mono, color: CYAN }}>{completionRate}%</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ label: "سلسلة الأيام", value: streak, suffix: "يوم" }, { label: "صباح", value: morningRate, suffix: "%" }, { label: "مساء", value: eveningRate, suffix: "%" }]
                .map((s) => (
                  <div key={s.label} style={{ padding: "10px 12px", borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 11, color: MUTED }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontFamily: mono, color: BRIGHT }}>{s.value}{s.suffix}</div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Adhkar Score */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={14} color={GOLD} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>حالة اليوم</span>
              </div>
              <span style={{ fontSize: 14, fontFamily: mono, fontWeight: 700, color: GOLD }}>{blocks.filter(b => b.done).length}/{blocks.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {blocks.map((b) => (
                <div key={b.id} style={{ padding: "8px 10px", borderRadius: 6, background: BG, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${BORDER}` }}>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED }}>{b.nameEn}</div>
                    <div style={{ fontSize: 11, fontFamily: ar, color: b.done ? b.color : TEXT }}>{b.nameAr}</div>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: mono, color: b.done ? b.color : MUTED }}>{b.done ? "✓" : "…"}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
