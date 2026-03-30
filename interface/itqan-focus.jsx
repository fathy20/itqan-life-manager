import { useState, useEffect, useRef } from "react";
import {
  Timer, Play, Pause, RotateCcw, SkipForward, Coffee,
  Moon, CheckCircle2, Flame, Zap, Target, BarChart3,
  Clock, BookOpen, Briefcase, GraduationCap, Brain,
  Volume2, VolumeX, Settings, Award, TrendingUp
} from "lucide-react";

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";

const MODES = [
  { id: "focus", label: "Focus", labelAr: "تركيز", mins: 25, color: "#F87171" },
  { id: "short", label: "Short break", labelAr: "راحة قصيرة", mins: 5, color: "#34D399" },
  { id: "long", label: "Long break", labelAr: "راحة طويلة", mins: 15, color: "#60A5FA" },
];

const CATEGORIES = [
  { id: "study", label: "Study", icon: GraduationCap, color: "#60A5FA" },
  { id: "work", label: "Work", icon: Briefcase, color: "#FB923C" },
  { id: "quran", label: "Quran", icon: BookOpen, color: "#34D399" },
  { id: "other", label: "Other", icon: Brain, color: "#A78BFA" },
];

const TODAY_SESSIONS = [
  { cat: "study", label: "Physics Ch.7", dur: 25, time: "9:00" },
  { cat: "study", label: "Data Structures", dur: 25, time: "9:35" },
  { cat: "work", label: "FlightAssist API", dur: 50, time: "10:15" },
  { cat: "quran", label: "Hifz review", dur: 25, time: "11:10" },
];

export default function FocusTimer() {
  const [mode, setMode] = useState(0);
  const [secs, setSecs] = useState(MODES[0].mins * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(4);
  const [category, setCategory] = useState("study");
  const [sound, setSound] = useState(true);
  const intervalRef = useRef(null);

  const currentMode = MODES[mode];
  const totalSecs = currentMode.mins * 60;
  const pct = ((totalSecs - secs) / totalSecs) * 100;

  useEffect(() => {
    if (running && secs > 0) {
      intervalRef.current = setInterval(() => setSecs(s => s - 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, secs]);

  useEffect(() => {
    if (secs === 0 && running) {
      setRunning(false);
      if (mode === 0) setSessions(s => s + 1);
    }
  }, [secs, running, mode]);

  const switchMode = (i) => { setMode(i); setSecs(MODES[i].mins * 60); setRunning(false); };
  const reset = () => { setSecs(currentMode.mins * 60); setRunning(false); };
  const m = Math.floor(secs / 60);
  const s = secs % 60;

  const SIZE = 280;
  const r = (SIZE - 24) / 2;
  const c = Math.PI * 2 * r;
  const offset = c - (c * pct) / 100;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{box-shadow:0 0 30px ${currentMode.color}15} 50%{box-shadow:0 0 50px ${currentMode.color}25} }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, opacity: 0, animation: "fi 0.4s ease forwards" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Timer size={20} color="#FB923C" />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>التركيز</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Focus Timer</span>
          </div>
          <div style={{ fontSize: 12, color: MUTED }}>Pomodoro — Prayer-aware scheduling</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, background: CARD, border: `1px solid ${BORDER}` }}>
            <Moon size={12} color="#A78BFA" />
            <span style={{ fontSize: 11, color: TEXT }}>العصر in <span style={{ fontFamily: mono, color: "#A78BFA" }}>1h 22m</span></span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        {/* LEFT - Timer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          {/* Mode Tabs */}
          <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: CARD, border: `1px solid ${BORDER}` }}>
            {MODES.map((md, i) => (
              <button key={md.id} onClick={() => switchMode(i)} style={{
                padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: mode === i ? `${md.color}15` : "transparent",
                border: mode === i ? `1px solid ${md.color}30` : "1px solid transparent",
                color: mode === i ? md.color : MUTED, transition: "all 0.2s",
              }}>{md.label}</button>
            ))}
          </div>

          {/* Category */}
          <div style={{ display: "flex", gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                background: category === cat.id ? `${cat.color}10` : "transparent",
                border: `1px solid ${category === cat.id ? `${cat.color}25` : BORDER}`,
                color: category === cat.id ? cat.color : MUTED,
              }}>
                <cat.icon size={13} />{cat.label}
              </button>
            ))}
          </div>

          {/* Timer Ring */}
          <div style={{
            position: "relative", width: SIZE, height: SIZE,
            animation: running ? "pulse 3s ease infinite" : "none",
          }}>
            <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none" stroke="#0C2550" strokeWidth="10" />
              <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none" stroke={currentMode.color} strokeWidth="10"
                strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: running ? "stroke-dashoffset 1s linear" : "stroke-dashoffset 0.5s ease" }} />
              <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none" stroke={currentMode.color} strokeWidth="20" opacity="0.06"
                strokeDasharray={c} strokeDashoffset={offset}
                style={{ transition: running ? "stroke-dashoffset 1s linear" : "stroke-dashoffset 0.5s ease", filter: "blur(8px)" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 60, fontWeight: 700, fontFamily: mono, color: BRIGHT, letterSpacing: "-3px" }}>
                {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 12, color: currentMode.color, fontFamily: ar, marginTop: 4 }}>{currentMode.labelAr}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={reset} style={{
              width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
              background: "transparent", border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><RotateCcw size={18} color={MUTED} /></button>

            <button onClick={() => setRunning(!running)} style={{
              width: 72, height: 72, borderRadius: "50%", cursor: "pointer",
              background: running ? `${currentMode.color}20` : currentMode.color,
              border: running ? `2px solid ${currentMode.color}40` : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {running ? <Pause size={28} color={currentMode.color} /> : <Play size={28} color="#000E30" style={{ marginLeft: 3 }} />}
            </button>

            <button onClick={() => switchMode((mode + 1) % 3)} style={{
              width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
              background: "transparent", border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><SkipForward size={18} color={MUTED} /></button>
          </div>

          {/* Session Dots */}
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: "50%",
                background: i < sessions % 4 ? currentMode.color : "#0C2550",
                border: `1px solid ${i < sessions % 4 ? `${currentMode.color}50` : BORDER}`,
                transition: "all 0.3s",
              }} />
            ))}
            <span style={{ fontSize: 10, color: MUTED, marginLeft: 4, fontFamily: mono }}>
              {sessions} sessions today
            </span>
          </div>
        </div>

        {/* RIGHT - Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Today Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: Zap, l: "Sessions", v: sessions, c: "#FB923C" },
              { icon: Clock, l: "Total focus", v: `${sessions * 25}m`, c: CYAN },
              { icon: Flame, l: "Streak", v: "5d", c: "#FB923C" },
              { icon: Award, l: "Score pts", v: "+3", c: "#34D399" },
            ].map(s => (
              <div key={s.l} style={{
                padding: "14px", borderRadius: 12, background: CARD, border: `1px solid ${BORDER}`, textAlign: "center",
              }}>
                <s.icon size={16} color={s.c} style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: mono, color: BRIGHT }}>{s.v}</div>
                <div style={{ fontSize: 10, color: MUTED }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Today's Sessions */}
          <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <BarChart3 size={14} color="#60A5FA" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Today's sessions</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TODAY_SESSIONS.map((sess, i) => {
                const catData = CATEGORIES.find(c => c.id === sess.cat);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                    borderRadius: 8, background: BG, border: `1px solid ${BORDER}`,
                    opacity: 0, animation: `fi 0.3s ease ${i * 0.06}s forwards`,
                  }}>
                    <catData.icon size={14} color={catData.color} />
                    <span style={{ flex: 1, fontSize: 12, color: TEXT }}>{sess.label}</span>
                    <span style={{ fontSize: 10, fontFamily: mono, color: MUTED }}>{sess.dur}m</span>
                    <span style={{ fontSize: 10, fontFamily: mono, color: "#1A3050" }}>{sess.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prayer Alert */}
          <div style={{
            padding: "14px 16px", borderRadius: 12, background: `#A78BFA08`,
            border: `1px solid #A78BFA15`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Moon size={13} color="#A78BFA" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#A78BFA" }}>Prayer reminder</span>
            </div>
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, margin: 0 }}>
              Al-Asr is in 1h 22m. Your current session will end before the prayer time. Keep going!
            </p>
          </div>

          {/* Tips */}
          <div style={{
            padding: "14px 16px", borderRadius: 12, background: CARD, border: `1px solid ${BORDER}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Brain size={13} color={CYAN} />
              <span style={{ fontSize: 12, fontWeight: 600, color: CYAN }}>Focus tip</span>
            </div>
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, margin: 0, fontFamily: ar }}>
              جرب تقرأ أذكار قبل ما تبدأ الجلسة — "بسم الله توكلت على الله ولا حول ولا قوة إلا بالله". هتلاقي تركيزك أفضل.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
