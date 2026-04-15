import { useState } from "react";
import { ArrowLeft, Trophy, Users, Star, TrendingUp } from "lucide-react";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#F472B6"; // Pink for Sibaq

export default function SibaqSystem({ onBack }: { onBack: () => void }) {
  
  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #DB2777)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Trophy color="white" size={20} />
    </div>
  );

  const LEADERS = [
    { name: "فوزي محمد", score: 9850, rank: 1, avatar: "F" },
    { name: "أحمد علي", score: 8700, rank: 2, avatar: "A" },
    { name: "ياسين خالد", score: 8200, rank: 3, avatar: "Y" },
    { name: "أنت", score: 7500, rank: 4, avatar: "U", isSelf: true },
  ];

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
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>سباق الإتقان</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>SOCIAL ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Podium/Rankings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
           <h2 style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8", marginBottom: 8 }}>لوحة المتصدرين</h2>
           {LEADERS.map((user, i) => (
             <div key={i} className="glass-card" style={{ 
               padding: "16px 24px", display: "flex", alignItems: "center", gap: 16,
               animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`,
               border: user.isSelf ? `1px solid ${ACCENT}` : `1px solid ${BORDER_COLOR}`,
               background: user.isSelf ? `${ACCENT}10` : CARD_BG
             }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: i < 3 ? "#F59E0B" : "#64748B", width: 30 }}>{user.rank}</div>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700 }}>{user.avatar}</div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{user.name} {user.isSelf && "(أنت)"}</div>
                   <div style={{ fontSize: 12, color: "#64748B" }}>نقاط اليوم: {user.score}</div>
                </div>
                <TrendingUp color={i < 2 ? "#10B981" : "#64748B"} size={20} />
             </div>
           ))}
        </div>

      </div>
    </div>
  );
}
