import { useState } from "react";
import { ArrowLeft, Send, Sparkles, User, Bot } from "lucide-react";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#A855F7"; // Purple/Pink for Coach

export default function CoachScreen({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState([
    { role: "bot", content: "السلام عليكم! أنا رفيقك الذكي في رحلة الإتقان. كيف يمكنني مساعدتك في يومك؟" }
  ]);
  const [input, setInput] = useState("");

  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #7E22CE)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Sparkles color="white" size={20} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#F1F5F9", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700;900&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px", borderBottom: `1px solid ${BORDER_COLOR}`, background: "rgba(2, 6, 23, 0.8)",
        backdropFilter: "blur(20px)", zIndex: 100
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={18} /> الرئيسية
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>المدرب الذكي</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>AI COACH ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
         {messages.map((m, i) => (
           <div key={i} style={{ 
             alignSelf: m.role === "user" ? "flex-start" : "flex-end",
             maxWidth: "80%", display: "flex", gap: 12, flexDirection: m.role === "user" ? "row" : "row-reverse"
           }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: "50%", background: m.role === "bot" ? ACCENT : "#334155",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {m.role === "bot" ? <Bot size={18} color="white" /> : <User size={18} color="white" />}
              </div>
              <div style={{ 
                padding: "16px 20px", borderRadius: "20px",
                background: m.role === "bot" ? CARD_BG : `${ACCENT}15`,
                border: `1px solid ${m.role === "bot" ? BORDER_COLOR : `${ACCENT}40`}`,
                fontFamily: "'Noto Kufi Arabic', sans-serif", fontSize: 15, lineHeight: 1.6
              }}>{m.content}</div>
           </div>
         ))}
      </div>

      {/* Input */}
      <div style={{ padding: "30px 40px", borderTop: `1px solid ${BORDER_COLOR}`, background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(20px)" }}>
         <div style={{ 
           maxWidth: "800px", margin: "0 auto", display: "flex", gap: 12, 
           background: "rgba(0,0,0,0.2)", padding: "8px", borderRadius: "20px", border: `1px solid ${BORDER_COLOR}`
         }}>
            <input 
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "white", padding: "0 20px", fontSize: 16, fontFamily: "'Noto Kufi Arabic', sans-serif" }} 
              placeholder="اكتب استفسارك هنا..." 
            />
            <button style={{ width: 44, height: 44, borderRadius: "16px", background: ACCENT, color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={20} />
            </button>
         </div>
      </div>
    </div>
  );
}
