/**
 * FocusScreen — Focus Timer (Pomodoro-style)
 * Connected to: focusApiNew
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, ArrowLeft, Play, Pause, RotateCcw, Check, Zap } from "lucide-react";
import { focusApiNew } from "../lib/api/index";
import type { FocusSession } from "../types/new";

const BG = "#020617";
const CARD = "rgba(15, 23, 42, 0.7)";
const BORDER = "rgba(51, 65, 85, 0.4)";
const TEXT = "#C0C8D8";
const MUTED = "#3D5A80";
const ACCENT = "#FB923C";

const PRESETS = [
  { label: "25 دقيقة", minutes: 25 },
  { label: "45 دقيقة", minutes: 45 },
  { label: "60 دقيقة", minutes: 60 },
  { label: "90 دقيقة", minutes: 90 },
];

const TYPE_OPTS = [
  { id: "study", label: "دراسة", color: "#8B5CF6" },
  { id: "work", label: "عمل", color: "#3B82F6" },
  { id: "quran", label: "قرآن", color: "#10B981" },
  { id: "other", label: "أخرى", color: "#FB923C" },
] as const;

export default function FocusScreen({ onBack }: { onBack: () => void }) {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Timer state
  const [duration, setDuration] = useState(25);
  const [type, setType] = useState<FocusSession["type"]>("study");
  const [label, setLabel] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const res = await focusApiNew.list();
    if (res.success && res.data) setSessions(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Timer logic
  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const completeSession = async () => {
    const res = await focusApiNew.create({ duration, type, label: label || undefined });
    if (res.success && res.data) setSessions(prev => [res.data!, ...prev]);
  };

  const toggleTimer = () => setRunning(!running);
  const resetTimer = () => { setRunning(false); setTimeLeft(duration * 60); };
  const selectPreset = (mins: number) => { setDuration(mins); setTimeLeft(mins * 60); setRunning(false); };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (duration * 60);
  const circumference = 2 * Math.PI * 120;
  const typeColor = TYPE_OPTS.find(t => t.id === type)?.color || ACCENT;

  const todaySessions = sessions.filter(s => s.completedAt?.startsWith(new Date().toISOString().split("T")[0]));
  const todayMinutes = todaySessions.reduce((a, s) => a + (s.duration || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(20px)", zIndex: 10 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", fontSize: 13 }}><ArrowLeft size={16} /> الرئيسية</button>
        <div style={{ flex: 1 }} />
        <Timer size={20} color={ACCENT} />
        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>التركيز</span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
        {/* Timer Ring */}
        <div style={{ position: "relative", width: 280, height: 280, margin: "0 auto 32px" }}>
          <svg width={280} height={280} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={140} cy={140} r={120} fill="none" stroke={BORDER} strokeWidth={6} />
            <circle cx={140} cy={140} r={120} fill="none" stroke={typeColor} strokeWidth={6}
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 52, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: TEXT, letterSpacing: 2 }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 12, color: MUTED, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              {running ? "جاري التركيز..." : "اختر وقتك وابدأ"}
            </div>
          </div>
        </div>

        {/* Preset buttons */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {PRESETS.map(p => (
            <button key={p.minutes} onClick={() => selectPreset(p.minutes)} style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 13, cursor: "pointer",
              background: duration === p.minutes ? typeColor + "20" : CARD,
              border: `1px solid ${duration === p.minutes ? typeColor + "40" : BORDER}`,
              color: duration === p.minutes ? typeColor : MUTED,
            }}>{p.label}</button>
          ))}
        </div>

        {/* Type selector */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {TYPE_OPTS.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} style={{
              padding: "8px 16px", borderRadius: 20, fontSize: 12, cursor: "pointer",
              background: type === t.id ? t.color + "20" : "transparent",
              border: `1px solid ${type === t.id ? t.color : BORDER}`,
              color: type === t.id ? t.color : MUTED,
              fontFamily: "'Noto Kufi Arabic', sans-serif",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Label */}
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="وصف اختياري..."
          style={{ width: 280, background: CARD, backdropFilter: "blur(12px)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 16px", color: TEXT, fontSize: 13, fontFamily: "'Noto Kufi Arabic', sans-serif", textAlign: "center", marginBottom: 24 }} />

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 40 }}>
          <button onClick={resetTimer} style={{ width: 48, height: 48, borderRadius: "50%", background: CARD, backdropFilter: "blur(12px)", border: `1px solid ${BORDER}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RotateCcw size={18} color={MUTED} />
          </button>
          <button onClick={toggleTimer} style={{
            width: 64, height: 64, borderRadius: "50%", cursor: "pointer",
            background: running ? RED + "20" : typeColor + "20",
            border: `2px solid ${running ? RED : typeColor}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 30px ${running ? RED : typeColor}20`,
          }}>
            {running ? <Pause size={24} color={RED} /> : <Play size={24} color={typeColor} style={{ marginLeft: 3 }} />}
          </button>
          <button onClick={() => { if (!running && timeLeft < duration * 60) completeSession(); }} style={{ width: 48, height: 48, borderRadius: "50%", background: CARD, backdropFilter: "blur(12px)", border: `1px solid ${BORDER}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={18} color="#10B981" />
          </button>
        </div>

        {/* Today stats */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 32 }}>
          <div style={{ background: CARD, backdropFilter: "blur(12px)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: typeColor, fontFamily: "'JetBrains Mono', monospace" }}>{todaySessions.length}</div>
            <div style={{ fontSize: 11, color: MUTED }}>جلسات اليوم</div>
          </div>
          <div style={{ background: CARD, backdropFilter: "blur(12px)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: typeColor, fontFamily: "'JetBrains Mono', monospace" }}>{todayMinutes}</div>
            <div style={{ fontSize: 11, color: MUTED }}>دقيقة تركيز</div>
          </div>
        </div>

        {/* Recent sessions */}
        {todaySessions.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 8 }}>جلسات اليوم</div>
            {todaySessions.slice(0, 5).map(s => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                background: CARD, backdropFilter: "blur(12px)", border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 6,
              }}>
                <Zap size={14} color={TYPE_OPTS.find(t => t.id === s.type)?.color || ACCENT} />
                <span style={{ flex: 1, fontSize: 13 }}>{s.label || TYPE_OPTS.find(t => t.id === s.type)?.label}</span>
                <span style={{ fontSize: 12, color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>{s.duration} دقيقة</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const RED = "#F87171";
