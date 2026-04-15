/**
 * HealthScreen — Lifestyle logs, Habits, Exercise tracking
 * Connected to: lifestyleApiNew, habitsApiNew
 */
import { useState, useEffect, useCallback } from "react";
import {
  Heart, ArrowLeft, Moon, Smartphone, Droplets,
  Footprints, Dumbbell, Plus, Check, Flame,
} from "lucide-react";
import { lifestyleApiNew, habitsApiNew } from "../lib/api/index";
import type { LifestyleLog, Habit } from "../types/new";

const BG = "#020617";
const CARD = "rgba(15, 23, 42, 0.7)";
const BORDER = "rgba(51, 65, 85, 0.4)";
const TEXT = "#C0C8D8";
const MUTED = "#3D5A80";
const ACCENT = "#EC4899";

const TABS = [
  { id: "today", label: "اليوم" },
  { id: "habits", label: "العادات" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function HealthScreen({ onBack }: { onBack: () => void }) {

  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Heart color="white" size={20} />
    </div>
  );

  const [tab, setTab] = useState<TabId>("today");
  const [todayLog, setTodayLog] = useState<Partial<LifestyleLog>>({});
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];

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
    await lifestyleApiNew.create({
      ...todayLog,
      date: today,
      sleepHours: todayLog.sleepHours || 0,
      phoneHours: todayLog.phoneHours || 0,
      waterLiters: todayLog.waterLiters || 0,
      steps: todayLog.steps || 0,
    } as any);
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
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(20px)", zIndex: 10 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", fontSize: 13 }}><ArrowLeft size={16} /> الرئيسية</button>
        <div style={{ flex: 1 }} />
        <Heart size={20} color={ACCENT} />
        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الصحة</span>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 24px", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: tab === t.id ? ACCENT + "15" :  'transparent',
              border: `1px solid ${tab === t.id ? ACCENT + "40" : BORDER}`,
              color: tab === t.id ? ACCENT : MUTED,
              fontFamily: "'Noto Kufi Arabic', sans-serif",
            }}>{t.label}</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: "center", padding: 60, color: MUTED }}>جاري التحميل...</div> : (
          <>
            {/* Today Tab */}
            {tab === "today" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { icon: Moon, label: "ساعات النوم", key: "sleepHours" as const, color: "#818CF8", unit: "ساعة", max: 12 },
                  { icon: Smartphone, label: "وقت الهاتف", key: "phoneHours" as const, color: "#FB923C", unit: "ساعة", max: 12 },
                  { icon: Droplets, label: "شرب الماء", key: "waterLiters" as const, color: "#06B6D4", unit: "لتر", max: 5 },
                  { icon: Footprints, label: "الخطوات", key: "steps" as const, color: "#10B981", unit: "خطوة", max: 20000 },
                ].map(item => (
                  <div key={item.key} className="glass-card" style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(12px)", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, animation: "fadeIn 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: item.color + "15" }}>
                        <item.icon size={18} color={item.color} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{item.label}</span>
                    </div>
                    <input
                      type="number"
                      value={(todayLog as any)[item.key] || ""}
                      onChange={e => setTodayLog(prev => ({ ...prev, [item.key]: parseFloat(e.target.value) || 0 }))}
                      placeholder={`0 ${item.unit}`}
                      style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}
                    />
                    <div style={{ fontSize: 10, color: MUTED, textAlign: "center", marginTop: 6 }}>{item.unit}</div>
                  </div>
                ))}

                <div style={{ gridColumn: "span 2" }}>
                  <button onClick={saveToday} disabled={saving} style={{
                    width: "100%", padding: "14px", borderRadius: 12,
                    background: ACCENT + "20", border: `1px solid ${ACCENT}40`,
                    color: ACCENT, cursor: "pointer", fontSize: 15, fontWeight: 700,
                    fontFamily: "'Noto Kufi Arabic', sans-serif",
                    opacity: saving ? 0.5 : 1,
                  }}>{saving ? "جاري الحفظ..." : "💾 حفظ تسجيل اليوم"}</button>
                </div>
              </div>
            )}

            {/* Habits Tab */}
            {tab === "habits" && (
              <div>
                {habits.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 60, color: MUTED, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>لا توجد عادات بعد</div>
                ) : habits.map(h => {
                  const isDone = (h.completedDates || []).includes(today);
                  const streak = getStreak(h.completedDates || []);
                  return (
                    <div key={h.id} onClick={() => toggleHabit(h)} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                      className="glass-card" style={{ background: "rgba(15, 23, 42, 0.4)" , backdropFilter: "blur(12px)", border: `1px solid ${isDone ? "#10B98140" : BORDER}`,
                      borderRadius: 14, marginBottom: 10, cursor: "pointer",
                      transition: "all 0.2s", animation: "fadeIn 0.3s",
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        border: `2px solid ${isDone ? "#10B981" : BORDER}`,
                        background: isDone ? "#10B98120" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{isDone && <Check size={14} color="#10B981" />}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Noto Kufi Arabic', sans-serif", color: isDone ? "#10B981" : TEXT }}>{h.name}</div>
                        {h.nameAr && <div style={{ fontSize: 12, color: MUTED }}>{h.nameAr}</div>}
                      </div>
                      {streak > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#FB923C" }}>
                          <Flame size={14} /> {streak}
                        </div>
                      )}
                      {h.icon && <span style={{ fontSize: 20 }}>{h.icon}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
