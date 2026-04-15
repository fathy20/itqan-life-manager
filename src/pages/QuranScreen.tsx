import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Bookmark, Play, Search } from "lucide-react";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#10B981"; // Emerald for Quran

export default function QuranScreen({ onBack }: { onBack: () => void }) {
  
  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #047857)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <BookOpen color="white" size={20} />
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
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>القرآن الكريم</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>QURAN ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Last Read Hero */}
        <div className="glass-card" style={{ padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", animation: "fadeInUp 0.6s ease-out", border: `1px solid ${ACCENT}20` }}>
           <div>
              <p style={{ color: ACCENT, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", marginBottom: "8px" }}>LAST READ</p>
              <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "4px", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>سورة البقرة</h2>
              <p style={{ color: "#94A3B8" }}>الآية رقم 154 · الجزء الثاني</p>
           </div>
           <button style={{ width: 64, height: 64, borderRadius: "50%", background: ACCENT, color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 25px ${ACCENT}40` }}>
              <Play size={24} fill="white" />
           </button>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
           {[
             { label: "المصحف المعلم", icon: BookOpen, color: "#3B82F6" },
             { label: "علاماتي", icon: Bookmark, color: "#F59E0B" },
             { label: "البحث في الآيات", icon: Search, color: "#8B5CF6" },
           ].map((item, i) => (
             <div key={i} className="glass-card" style={{ padding: "24px", textAlign: "center", cursor: "pointer", animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                <div style={{ color: item.color, marginBottom: "12px", display: "flex", justifyContent: "center" }}><item.icon size={28} /></div>
                <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{item.label}</span>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
}
