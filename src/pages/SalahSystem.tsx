import { useState, useEffect } from "react";
import { ArrowLeft, Clock, MapPin, CheckCircle2, Moon } from "lucide-react";

type SalahTimes = {
  fajr: string;
  sunrise?: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#8B5CF6"; // Purple for Salah

export default function SalahSystem({ onBack }: { onBack: () => void }) {
  const [times, setTimes] = useState<SalahTimes | null>(null);
  
  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #6D28D9)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Moon color="white" size={20} />
    </div>
  );

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
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>مواقيت الصلاة</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>PRAYER ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Next Prayer Hero */}
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", marginBottom: "32px", animation: "fadeInUp 0.6s ease-out", border: `1px solid ${ACCENT}30` }}>
           <p style={{ color: ACCENT, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" }}>Next Prayer</p>
           <h2 style={{ fontSize: "48px", fontWeight: 900, marginBottom: "8px", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>العصر</h2>
           <div style={{ fontSize: "24px", color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>03:22 PM</div>
        </div>

        {/* Prayer List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {["الفجر", "الظهر", "العصر", "المغرب", "العشاء"].map((prayer, i) => (
            <div key={i} className="glass-card" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
               <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: i === 2 ? ACCENT : "#334155" }} />
                  <span style={{ fontSize: "18px", fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{prayer}</span>
               </div>
               <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <span style={{ fontSize: "16px", color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>04:12 AM</span>
                  <CheckCircle2 color={i < 2 ? "#10B981" : "#334155"} size={24} />
               </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
