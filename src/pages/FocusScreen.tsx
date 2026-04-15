import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, ArrowLeft, Play, Pause, RotateCcw, Check, Zap } from "lucide-react";
import { focusApiNew } from "../lib/api/index";
import type { FocusSession } from "../types/new";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#EC4899"; // Pink for Focus

export default function FocusScreen({ onBack }: { onBack: () => void }) {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #BE185D)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Timer color="white" size={20} />
    </div>
  );

  const fetchSessions = useCallback(async () => {
    const res = await focusApiNew.list();
    if (res.success && res.data) setSessions(res.data);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, timeLeft]);

  const toggleTimer = () => setRunning(!running);
  const resetTimer = () => { setRunning(false); setTimeLeft(duration * 60); };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - (timeLeft / (duration * 60));

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#F1F5F9" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
      
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
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>مؤقّت التركيز</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>FOCUS SESSION</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        
        {/* Timer Ring */}
        <div style={{ position: "relative", width: 300, height: 300, margin: "0 auto 48px" }}>
           <svg width={300} height={300} style={{ transform: "rotate(-90deg)" }}>
             <circle cx={150} cy={150} r={135} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
             <circle cx={150} cy={150} r={135} fill="none" stroke={ACCENT} strokeWidth={10} 
               strokeDasharray={2 * Math.PI * 135} 
               strokeDashoffset={2 * Math.PI * 135 * (1 - progress)}
               strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
           </svg>
           <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "64px", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: "#F1F5F9" }}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <p style={{ fontSize: 12, color: "#64748B", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                {running ? "جاري التركيز..." : "جاهز للبدء؟"}
              </p>
           </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 60 }}>
           <button onClick={resetTimer} style={{ width: 56, height: 56, borderRadius: "50%", background: CARD_BG, border: `1px solid ${BORDER_COLOR}`, color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <RotateCcw size={24} />
           </button>
           <button onClick={toggleTimer} style={{
             width: 80, height: 80, borderRadius: "50%", background: running ? "#EF444420" : `${ACCENT}20`,
             border: `2px solid ${running ? "#EF4444" : ACCENT}`,
             color: running ? "#EF4444" : ACCENT,
             cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
             boxShadow: `0 0 40px ${running ? "#EF444430" : `${ACCENT}30`}`
           }}>
             {running ? <Pause size={32} /> : <Play size={32} style={{marginLeft: 4}} />}
           </button>
           <button style={{ width: 56, height: 56, borderRadius: "50%", background: CARD_BG, border: `1px solid ${BORDER_COLOR}`, color: "#10B981", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <Check size={24} />
           </button>
        </div>

        {/* History */}
        <div style={{ textAlign: "right" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#94A3B8", marginBottom: 16, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>تاريخ الجلسات</h3>
          {sessions.slice(0, 3).map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Zap size={16} color={ACCENT} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{s.label || 'جلسة تركيز'}</span>
               </div>
               <span style={{ fontSize: 12, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>{s.duration} MIN</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
