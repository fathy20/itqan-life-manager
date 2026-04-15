import { useState } from "react";
import { ArrowLeft, Brain, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#38BDF8"; // Sky Blue for Intelligence

export default function IntelligenceScreen({ onBack }: { onBack: () => void }) {
  
  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #0284C7)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Brain color="white" size={20} />
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
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>تحليل الإتقان</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>INTELLIGENCE ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Productivity Score Hero */}
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", marginBottom: "32px", animation: "fadeInUp 0.6s ease-out", border: `1px solid ${ACCENT}30` }}>
           <p style={{ color: ACCENT, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", marginBottom: "12px" }}>OVERALL PERFORMANCE</p>
           <h2 style={{ fontSize: "64px", fontWeight: 900, marginBottom: "8px", color: ACCENT }}>85%</h2>
           <div style={{ fontSize: "18px", color: "#94A3B8", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>إداء ممتاز هذا الأسبوع</div>
        </div>

        {/* Intelligence Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
           {[
             { label: "تفاعلية العادات", status: "تحسن +12%", icon: Activity, color: "#10B981" },
             { label: "توزيع الوقت", status: "متوازن", icon: PieChart, color: "#8B5CF6" },
             { label: "الالتزام المالي", status: "جيد", icon: BarChart3, color: "#F59E0B" },
             { label: "مستوى التركيز", status: "متصاعد", icon: TrendingUp, color: ACCENT },
           ].map((item, i) => (
             <div key={i} className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: 20, animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                <div style={{ width: 44, height: 44, borderRadius: "12px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <item.icon size={24} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: item.color, fontWeight: 700 }}>{item.status}</div>
                </div>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
}
