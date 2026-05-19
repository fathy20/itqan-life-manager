import { useState } from "react";
import { ArrowLeft, Star, Sun, Moon, Wind, MessageSquare } from "lucide-react";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#F59E0B"; // Amber for Adhkar

export default function AdhkarSystem({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  
  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #D97706)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Star color="white" size={20} />
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
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>حصن المسلم</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>ADHAKAR ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Adhkar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
           {[
             { label: "أذكار الصباح", icon: Sun, color: "#F59E0B" },
             { label: "أذكار المساء", icon: Moon, color: "#8B5CF6" },
             { label: "أذكار النوم", icon: Wind, color: "#3B82F6" },
             { label: "أدعية منوعة", icon: MessageSquare, color: "#10B981" },
           ].map((item, i) => (
             <div
               key={i}
               onClick={() => setSelected(item.label)}
               className="glass-card"
               style={{
                 padding: "32px", textAlign: "center", cursor: "pointer",
                 animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`,
                 border: selected === item.label ? `2px solid ${item.color}` : `1px solid ${BORDER_COLOR}`,
                 transition: "all 0.2s",
               }}>
                <div style={{ color: item.color, marginBottom: "16px", display: "flex", justifyContent: "center" }}><item.icon size={40} /></div>
                <h3 style={{ fontSize: "20px", fontWeight: 900, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{item.label}</h3>
             </div>
           ))}
        </div>

        {selected && (
          <div className="glass-card" style={{ marginTop: 24, padding: 32, textAlign: "center", animation: "fadeInUp 0.4s ease-out" }}>
            <p style={{ fontSize: 14, color: ACCENT, fontWeight: 700, marginBottom: 8 }}>تم اختيار</p>
            <h3 style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Noto Kufi Arabic', sans-serif", marginBottom: 16 }}>{selected}</h3>
            <p style={{ color: "#94A3B8", fontSize: 13, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>سيتم عرض الأذكار قريباً بإذن الله</p>
            <button onClick={() => setSelected(null)} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 10, background: "transparent", border: `1px solid ${BORDER_COLOR}`, color: "#94A3B8", cursor: "pointer", fontSize: 13 }}>إغلاق</button>
          </div>
        )}

      </div>
    </div>
  );
}
