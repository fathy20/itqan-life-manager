import { useState } from "react";
import {
  Heart, CheckCircle2, Circle, Plus, Clock, Droplets,
  Footprints, Smartphone, Moon, Sun, Dumbbell, Apple,
  TrendingUp, Award, BarChart3, Flame, Target, Minus,
  Star, Brain, Zap, Trash2
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

const mono = "'JetBrains Mono', monospace"; const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";

const HABITS = [
  { name: "Wake for Fajr", nameAr: "الاستيقاظ للفجر", done: true, streak: 18, color: "#A78BFA" },
  { name: "Morning adhkar", nameAr: "أذكار الصباح", done: true, streak: 14, color: "#FBBF24" },
  { name: "Read Quran", nameAr: "قراءة قرآن", done: true, streak: 12, color: "#34D399" },
  { name: "Exercise", nameAr: "رياضة", done: false, streak: 3, color: "#F472B6" },
  { name: "Sleep before 11", nameAr: "النوم قبل ١١", done: false, streak: 5, color: "#818CF8" },
  { name: "No phone 1h before sleep", nameAr: "بدون موبايل قبل النوم", done: false, streak: 2, color: "#60A5FA" },
  { name: "Drink 2.5L water", nameAr: "شرب ٢.٥ لتر ماء", done: false, streak: 8, color: "#06B6D4" },
  { name: "Siwak", nameAr: "السواك", done: true, streak: 10, color: "#34D399" },
];

const SLEEP_DATA = [
  { day: "سبت", hours: 7.5 }, { day: "أحد", hours: 6 }, { day: "اثنين", hours: 7 },
  { day: "ثلاثاء", hours: 5.5 }, { day: "أربعاء", hours: 6.5 }, { day: "خميس", hours: 8 }, { day: "جمعة", hours: 7 },
];

const SUNNAH_FOODS = [
  { name: "Dates (تمر)", eaten: true, benefit: "Energy + Sunnah of breaking fast" },
  { name: "Honey (عسل)", eaten: false, benefit: "Healing + immune boost" },
  { name: "Olive oil (زيتون)", eaten: true, benefit: "Heart health + blessed tree" },
  { name: "Black seed (حبة البركة)", eaten: false, benefit: "Cure for everything except death" },
  { name: "Milk (لبن)", eaten: true, benefit: "Strength + Prophet's drink" },
];

function Card({ children, style, glow }) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", position: "relative", overflow: "hidden", ...style }}>
      {glow && <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: glow, opacity: 0.04, filter: "blur(30px)", pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function SleepTip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, color: "#818CF8" }}>{payload[0].value}h</div>
    </div>
  );
}

export default function LifestyleSystem() {
  const [water, setWater] = useState(6);
  const waterTarget = 10;
  const doneHabits = HABITS.filter(h => h.done).length;
  const avgSleep = (SLEEP_DATA.reduce((a, b) => a + b.hours, 0) / 7).toFixed(1);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:2px; }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, opacity: 0, animation: "fi 0.4s ease forwards" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Heart size={20} color="#F87171" />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>الصحة وأسلوب الحياة</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Lifestyle & Health</span>
          </div>
          <div style={{ fontSize: 12, color: MUTED }}>Habits, sleep, nutrition, exercise — on the Sunnah</div>
        </div>
        <button style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "#F8717110", border: "1px solid #F8717125", color: "#F87171", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={13} /> Add habit
        </button>
      </div>

      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          { icon: CheckCircle2, l: "Habits done", v: `${doneHabits}/${HABITS.length}`, c: "#34D399" },
          { icon: Moon, l: "Avg sleep", v: `${avgSleep}h`, c: "#818CF8" },
          { icon: Smartphone, l: "Phone today", v: "2h15m", c: "#F472B6" },
          { icon: Dumbbell, l: "Exercise", v: "Not yet", c: "#FB923C" },
        ].map(s => (
          <Card key={s.l}>
            <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>{s.l}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <s.icon size={18} color={s.c} />
              <span style={{ fontSize: 22, fontWeight: 700, fontFamily: mono, color: s.c }}>{s.v}</span>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Habits */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={14} color="#34D399" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Daily habits</span>
            </div>
            <span style={{ fontSize: 11, fontFamily: mono, color: "#34D399" }}>{doneHabits}/{HABITS.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {HABITS.map((h, i) => (
              <div key={h.name} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderRadius: 10, background: BG, border: `1px solid ${h.done ? `${h.color}25` : BORDER}`,
                opacity: 0, animation: `fi 0.3s ease ${i * 0.04}s forwards`,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, cursor: "pointer", flexShrink: 0,
                  background: h.done ? h.color : "transparent",
                  border: h.done ? "none" : `1.5px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {h.done && <CheckCircle2 size={13} color="#000E30" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: h.done ? h.color : TEXT, fontWeight: h.done ? 500 : 400 }}>{h.name}</div>
                  <div style={{ fontSize: 10, fontFamily: ar, color: MUTED }}>{h.nameAr}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Flame size={11} color="#FB923C" />
                  <span style={{ fontSize: 11, fontFamily: mono, color: MUTED }}>{h.streak}d</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Water Tracker */}
          <Card glow="#06B6D4">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Droplets size={14} color="#06B6D4" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Water tracker</span>
              </div>
              <span style={{ fontSize: 12, fontFamily: mono, color: "#06B6D4" }}>{(water * 0.25).toFixed(1)}L / 2.5L</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {Array.from({ length: waterTarget }).map((_, i) => (
                <div key={i} onClick={() => setWater(i + 1)} style={{
                  flex: 1, height: 28, borderRadius: 4, cursor: "pointer",
                  background: i < water ? "#06B6D425" : "#0C2550",
                  border: `1px solid ${i < water ? "#06B6D435" : "#0C255080"}`,
                  transition: "all 0.15s",
                }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: MUTED, textAlign: "center", fontFamily: ar }}>
              سنة الثُلث: ثلث للطعام، ثلث للماء، ثلث للنَفَس
            </div>
          </Card>

          {/* Sleep Chart */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Moon size={14} color="#818CF8" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Sleep this week</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: mono, color: "#818CF8" }}>Avg: {avgSleep}h</span>
            </div>
            <div style={{ height: 100 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SLEEP_DATA} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="slG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: ar }} />
                  <Tooltip content={<SleepTip />} cursor={false} />
                  <Area type="monotone" dataKey="hours" stroke="#818CF8" strokeWidth={2} fill="url(#slG)"
                    dot={{ r: 3, fill: "#818CF8", stroke: BG, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Sunnah Foods */}
          <Card glow="#34D399">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Apple size={14} color="#34D399" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Sunnah foods today</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUNNAH_FOODS.map((f, i) => (
                <div key={f.name} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "6px 10px",
                  borderRadius: 6, background: BG,
                  opacity: 0, animation: `fi 0.3s ease ${i * 0.05}s forwards`,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    background: f.eaten ? "#34D399" : "transparent",
                    border: f.eaten ? "none" : `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{f.eaten && <CheckCircle2 size={10} color="#000E30" />}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, color: f.eaten ? "#34D399" : TEXT }}>{f.name}</span>
                    <div style={{ fontSize: 9, color: MUTED }}>{f.benefit}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Health Score */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={14} color="#F472B6" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Health score</span>
              </div>
              <span style={{ fontSize: 14, fontFamily: mono, fontWeight: 700, color: "#F472B6" }}>7/10</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { l: "Sleep 6-8h", pts: "3", c: "#34D399" },
                { l: "Fajr wake", pts: "2", c: "#A78BFA" },
                { l: "Phone budget", pts: "0", c: MUTED },
                { l: "Water target", pts: "1", c: "#06B6D4" },
              ].map(s => (
                <div key={s.l} style={{ padding: "6px 10px", borderRadius: 6, background: BG, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: MUTED }}>{s.l}</span>
                  <span style={{ fontSize: 11, fontFamily: mono, fontWeight: 700, color: s.c }}>+{s.pts}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
