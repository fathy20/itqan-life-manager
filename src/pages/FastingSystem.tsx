import { useState } from "react";
import { ArrowLeft, Droplets, Calendar, Trophy, Zap } from "lucide-react";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#3B82F6"; // Blue for Fasting

export default function FastingSystem({ onBack }: { onBack: () => void }) {
  const [loggedToday, setLoggedToday] = useState(false);
  const [days, setDays] = useState(12);
  
  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #1D4ED8)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Droplets color="white" size={20} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#F1F5F9", paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700;900&display=swap" rel="stylesheet" />
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
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>نظام الصيام</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>FASTING ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Fasting Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
           {[
             { label: "أيام الصيام", value: String(days), icon: Calendar, color: "#10B981" },
             { label: "أيام القضاء", value: "0", icon: Zap, color: "#F59E0B" },
           ].map((item, i) => (
             <div key={i} className="glass-card" style={{ padding: "32px", textAlign: "center", animation: "fadeInUp 0.6s ease-out" }}>
                <div style={{ color: item.color, marginBottom: "12px", display: "flex", justifyContent: "center" }}><item.icon size={32} /></div>
                <div style={{ fontSize: "32px", fontWeight: 900 }}>{item.value}</div>
                <div style={{ fontSize: "14px", color: "#94A3B8", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{item.label}</div>
             </div>
           ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (loggedToday) return;
            setLoggedToday(true);
            setDays(d => d + 1);
          }}
          disabled={loggedToday}
          style={{
            width: "100%", padding: "20px", borderRadius: "20px",
            background: loggedToday ? "#10B981" : ACCENT, color: "white",
            border: "none", cursor: loggedToday ? "default" : "pointer",
            fontSize: "18px", fontWeight: 900, fontFamily: "'Noto Kufi Arabic', sans-serif",
            boxShadow: `0 10px 30px ${ACCENT}40`,
            opacity: loggedToday ? 0.85 : 1,
        }}>{loggedToday ? "✓ تم تسجيل صيام اليوم" : "تسجيل صيام اليوم"}</button>

      </div>
    </div>
  );
}
