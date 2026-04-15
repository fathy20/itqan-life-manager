import { useState, useEffect, useCallback } from "react";
import {
  Heart, ArrowLeft, Moon, Smartphone, Droplets,
  Footprints, Check, Flame
} from "lucide-react";
import { lifestyleApiNew, habitsApiNew } from "../lib/api/index";
import type { LifestyleLog, Habit } from "../types/new";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#EF4444"; // Red for Health

const TABS = [
  { id: "today", label: "تقرير اليوم" },
  { id: "habits", label: "نظام العادات" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function HealthScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<TabId>("today");
  const [todayLog, setTodayLog] = useState<Partial<LifestyleLog>>({});
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #B91C1C)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Heart color="white" size={20} />
    </div>
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [lRes, hRes] = await Promise.all([
      lifestyleApiNew.list(),
      habitsApiNew.list(),
    ]);
    if (lRes.success && lRes.data) {
      const todayEntry = lRes.data.find((l: any) => l.date === today || l.id === today);
      if (todayEntry) setTodayLog(todayEntry);
    }
    if (hRes.success && hRes.data) setHabits(hRes.data);
    setLoading(false);
  }, [today]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveToday = async () => {
    setSaving(true);
    await lifestyleApiNew.create({ ...todayLog, date: today } as any);
    setSaving(false);
  };

  const toggleHabit = async (habit: Habit) => {
    const dates = habit.completedDates || [];
    const hasToday = dates.includes(today);
    const newDates = hasToday ? dates.filter(d => d !== today) : [...dates, today];
    const res = await habitsApiNew.update(habit.id, { completedDates: newDates });
    if (res.success) {
      setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, completedDates: newDates } : h));
    }
  };

  const getStreak = (dates: string[]) => {
    const sorted = [...dates].sort().reverse();
    let streak = 0;
    for (const d of sorted) {
      const expected = new Date();
      expected.setDate(expected.getDate() - streak);
      if (d === expected.toISOString().split("T")[0]) streak++;
      else break;
    }
    return streak;
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#F1F5F9", paddingBottom: 60 }}>
       <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
       <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .glass-card { background: ${CARD_BG}; backdrop-filter: blur(12px); border: 1px solid ${BORDER_COLOR}; border-radius: 24px; }
      `}</style>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px", borderBottom: `1px solid ${BORDER_COLOR}`, background: "rgba(2, 6, 23, 0.8)",
        backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={18} /> الرئيسية
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الصحة والعادات</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>HEALTH ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", animation: "fadeInUp 0.6s ease-out" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "14px", borderRadius: "16px", cursor: "pointer", fontSize: "14px", fontWeight: 700,
              background: tab === t.id ? `${ACCENT}15` : CARD_BG,
              border: `1px solid ${tab === t.id ? ACCENT : BORDER_COLOR}`,
              color: tab === t.id ? ACCENT : "#94A3B8",
              fontFamily: "'Noto Kufi Arabic', sans-serif", transition: "all 0.3s"
            }}>{t.label}</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>جاري مزامنة بياناتك الصحية...</div> : (
          <>
            {tab === "today" && (
              <div style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                   {[
                     { icon: Moon, label: "ساعات النوم", key: "sleepHours", color: "#818CF8", unit: "ساعة" },
                     { icon: Smartphone, label: "وقت الهاتف", key: "phoneHours", color: "#F59E0B", unit: "ساعة" },
                     { icon: Droplets, label: "شرب الماء", key: "waterLiters", color: "#3B82F6", unit: "لتر" },
                     { icon: Footprints, label: "الخطوات", key: "steps", color: "#10B981", unit: "خطوة" },
                   ].map((item, i) => (
                      <div key={i} className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "10px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                             <item.icon size={18} color={item.color} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{item.label}</span>
                        </div>
                        <input
                          type="number"
                          value={(todayLog as any)[item.key] || ""}
                          onChange={e => setTodayLog(prev => ({ ...prev, [item.key]: parseFloat(e.target.value) || 0 }))}
                          style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "12px", color: "white", fontSize: "20px", fontWeight: 900, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}
                        />
                        <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#64748B", fontWeight: 700 }}>{item.unit}</div>
                      </div>
                   ))}
                </div>
                <button onClick={saveToday} disabled={saving} style={{
                  width: "100%", padding: "16px", borderRadius: "16px", background: ACCENT, color: "white",
                  border: "none", cursor: "pointer", fontWeight: 900, boxShadow: `0 8px 30px ${ACCENT}40`
                }}>{saving ? "جاري الحفظ..." : "حفظ تقرير اليوم"}</button>
              </div>
            )}

            {tab === "habits" && habits.map((h, i) => {
              const isDone = (h.completedDates || []).includes(today);
              const streak = getStreak(h.completedDates || []);
              return (
                <div key={h.id} onClick={() => toggleHabit(h)} className="glass-card" style={{
                  padding: "20px 24px", marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
                  borderRight: `4px solid ${isDone ? "#10B981" : "#334155"}`, transition: "all 0.3s"
                }}>
                   <div style={{
                     width: 32, height: 32, borderRadius: "10px", border: `2px solid ${isDone ? "#10B981" : "#334155"}`,
                     background: isDone ? "#10B981" : "none", display: "flex", alignItems: "center", justifyContent: "center"
                   }}>{isDone && <Check size={18} color="white" />}</div>
                   <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: isDone ? "#F1F5F9" : "#94A3B8", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{h.name}</p>
                      <p style={{ fontSize: 11, color: "#64748B" }}>{h.nameAr}</p>
                   </div>
                   {streak > 0 && <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#F59E0B", fontWeight: 800 }}> <Flame size={16} /> {streak} </div>}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
