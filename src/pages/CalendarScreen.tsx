import { useState } from "react";
import { ArrowLeft, Calendar as CalIcon, ChevronLeft, ChevronRight } from "lucide-react";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#A855F7"; // Purple for Calendar

export default function CalendarScreen({ onBack }: { onBack: () => void }) {
  
  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #7E22CE)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <CalIcon color="white" size={20} />
    </div>
  );

  const DAYS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
  const dates = Array.from({ length: 30 }, (_, i) => i + 1);

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
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>التقويم الشامل</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>CALENDAR ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Calendar Card */}
        <div className="glass-card" style={{ padding: "32px", animation: "fadeInUp 0.6s ease-out" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <ChevronLeft size={24} style={{ cursor: "pointer", color: "#64748B" }} />
              <h2 style={{ fontSize: "20px", fontWeight: 900, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>أبريل 2026</h2>
              <ChevronRight size={24} style={{ cursor: "pointer", color: "#64748B" }} />
           </div>

           <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", textAlign: "center" }}>
              {DAYS.map(d => <div key={d} style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 12 }}>{d}</div>)}
              {dates.map(date => (
                <div key={date} style={{ 
                  height: 44, borderRadius: "12px", 
                  background: date === 15 ? ACCENT : "rgba(255,255,255,0.02)", 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: date === 15 ? 900 : 600,
                  cursor: "pointer", border: date === 15 ? "none" : `1px solid ${BORDER_COLOR}10`
                }}>
                  {date}
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
