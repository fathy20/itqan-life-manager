import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Send, Moon, BookOpen, Star, Target, Clock,
  Brain, Heart, Flame, Zap, ChevronRight, Plus, User,
  AlertTriangle, TrendingUp, GraduationCap, Briefcase,
  Wallet, Calendar, RotateCcw
} from "lucide-react";

const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";

const SUGGESTIONS = [
  { text: "Plan my day", textAr: "خطط يومي", icon: Calendar, color: CYAN },
  { text: "Study strategy", textAr: "خطة مذاكرة", icon: GraduationCap, color: "#60A5FA" },
  { text: "Finance insights", textAr: "تحليل مالي", icon: Wallet, color: "#4ADE80" },
  { text: "Weekly review", textAr: "مراجعة أسبوعية", icon: TrendingUp, color: "#A78BFA" },
];

const INSIGHTS = [
  { icon: Moon, color: "#A78BFA", text: "Fajr streak: 7 days — keep it up!" },
  { icon: AlertTriangle, color: "#F87171", text: "Physics exam in 5 days — prioritize study" },
  { icon: Star, color: "#FBBF24", text: "Evening adhkar missed 3 days this week" },
  { icon: Flame, color: "#FB923C", text: "Overall streak: 18 days — you're on fire" },
];

const INIT_MESSAGES = [
  {
    role: "assistant", text: "السلام عليكم يا فتحي! 👋\n\nأنا مدربك في إتقان. أقدر أساعدك في:\n\n• تخطيط يومك مع مراعاة الصلوات\n• خطة مذاكرة للامتحانات\n• تحليل مالي ونصائح توفير\n• مراجعة أسبوعية لأدائك\n\nعايز تبدأ بإيه؟",
  },
  {
    role: "user", text: "عايز تخطط لي يومي النهاردة",
  },
  {
    role: "assistant", text: "تمام! بناءً على بياناتك:\n\n📋 **خطة يومك — الاثنين:**\n\n🌅 **الفجر 4:32** → صلاة + أذكار الصباح + قراءة 4 صفحات قرآن\n\n📚 **9:00 - 11:30** → مذاكرة الفيزياء (الامتحان بعد 5 أيام!)\nFocus: Chapter 7 — Electromagnetism\n\n🕐 **الظهر 12:15** → صلاة + راحة + غداء\n\n💼 **1:00 - 3:30** → FlightAssist API integration\n\n🕌 **العصر 3:45** → صلاة\n\n📖 **4:15 - 5:00** → مراجعة حفظ سورة الملك\n\n🏋️ **5:00 - 5:45** → تمارين + مشي\n\n🌅 **المغرب 6:22** → صلاة + أذكار المساء\n\n📚 **7:00 - 8:30** → Data Structures assignment\n\n🌙 **العشاء 7:42** → صلاة + وتر\n\n💤 **10:30** → محاسبة النفس + أذكار النوم\n\n⚠️ **تنبيه:** الفيزياء أولوية قصوى هذا الأسبوع. لو حسيت بضغط، خفف من FlightAssist وركز على الامتحان.",
  },
];

function ChatBubble({ msg, isLast }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 12, opacity: 0, animation: `fi 0.3s ease forwards`,
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0, marginRight: 10,
          background: `${CYAN}15`, border: `1px solid ${CYAN}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles size={14} color={CYAN} />
        </div>
      )}
      <div style={{
        maxWidth: "70%", padding: "12px 16px", borderRadius: 14,
        background: isUser ? `${CYAN}12` : CARD,
        border: `1px solid ${isUser ? `${CYAN}20` : BORDER}`,
        borderBottomRightRadius: isUser ? 4 : 14,
        borderBottomLeftRadius: isUser ? 14 : 4,
      }}>
        <div style={{
          fontSize: 13, color: TEXT, lineHeight: 1.7, whiteSpace: "pre-wrap",
          fontFamily: msg.text.match(/[\u0600-\u06FF]/) ? ar : "inherit",
        }}>{msg.text}</div>
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0, marginLeft: 10,
          background: "#A78BFA15", border: "1px solid #A78BFA25",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#A78BFA" }}>F</span>
        </div>
      )}
    </div>
  );
}

export default function AICoach() {
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "جاري التحليل... هذا المدرب يعمل بالـ AI (Gemini) من الـ backend. في النسخة الحقيقية هيقرأ بياناتك (صلوات، قرآن، مهام، ماليات) ويديك نصيحة مخصصة. 🧠",
      }]);
      setTyping(false);
    }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 28px", borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${CYAN}20, ${CYAN}08)`,
            border: `1px solid ${CYAN}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={18} color={CYAN} />
          </div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>المدرب الذكي</span>
            <span style={{ fontSize: 12, color: MUTED, marginLeft: 8, fontFamily: mono }}>AI Coach</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: MUTED }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
          <span>Powered by Gemini — Backend only</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 280px", minHeight: 0 }}>
        {/* Chat Area */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: `1px solid ${BORDER}` }}>
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
            {messages.map((msg, i) => <ChatBubble key={i} msg={msg} isLast={i === messages.length - 1} />)}
            {typing && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${CYAN}15`, border: `1px solid ${CYAN}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={14} color={CYAN} />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: "50%", background: CYAN,
                      animation: `blink 1s ease ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div style={{ padding: "0 28px 8px", display: "flex", gap: 8 }}>
            {SUGGESTIONS.map(sg => (
              <button key={sg.text} onClick={() => send(sg.textAr)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                borderRadius: 20, fontSize: 11, cursor: "pointer",
                background: `${sg.color}08`, border: `1px solid ${sg.color}20`, color: sg.color,
                transition: "all 0.2s",
              }}>
                <sg.icon size={12} />{sg.textAr}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 28px 16px", borderTop: `1px solid ${BORDER}` }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
              borderRadius: 14, background: CARD, border: `1px solid ${BORDER}`,
            }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send(input)}
                placeholder="اكتب رسالتك هنا..."
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: 13, color: TEXT, fontFamily: ar,
                }}
              />
              <button onClick={() => send(input)} style={{
                width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                background: input.trim() ? CYAN : "transparent",
                border: input.trim() ? "none" : `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                <Send size={14} color={input.trim() ? "#000E30" : MUTED} />
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: 9, color: "#1A3050", marginTop: 6 }}>
              المدرب لا يفتي — استشر أهل العلم في المسائل الشرعية
            </div>
          </div>
        </div>

        {/* Sidebar - Context */}
        <div style={{ padding: "16px", overflowY: "auto" }}>
          <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12, fontFamily: mono }}>
            Quick Insights
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INSIGHTS.map((ins, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 10, background: CARD, border: `1px solid ${BORDER}`,
                display: "flex", alignItems: "flex-start", gap: 10,
                opacity: 0, animation: `fi 0.3s ease ${i * 0.08}s forwards`,
              }}>
                <ins.icon size={14} color={ins.color} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: TEXT, lineHeight: 1.5 }}>{ins.text}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 20, marginBottom: 10, fontFamily: mono }}>
            Your context
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { l: "Score today", v: "83/100", c: CYAN },
              { l: "Prayers done", v: "2/5", c: "#A78BFA" },
              { l: "Quran pages", v: "2/4", c: "#34D399" },
              { l: "Tasks done", v: "2/5", c: "#60A5FA" },
              { l: "Streak", v: "18 days", c: "#FB923C" },
              { l: "Next exam", v: "5 days", c: "#F87171" },
              { l: "Phone usage", v: "2h15m", c: "#F472B6" },
            ].map(s => (
              <div key={s.l} style={{
                display: "flex", justifyContent: "space-between", padding: "6px 10px",
                borderRadius: 6, background: CARD, border: `1px solid ${BORDER}`,
              }}>
                <span style={{ fontSize: 10, color: MUTED }}>{s.l}</span>
                <span style={{ fontSize: 11, fontFamily: mono, color: s.c }}>{s.v}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16, padding: "10px 12px", borderRadius: 10,
            background: `${CYAN}06`, border: `1px solid ${CYAN}10`,
            fontSize: 10, color: MUTED, lineHeight: 1.5, textAlign: "center",
          }}>
            The coach reads your data (prayers, quran, tasks, finance) to give personalized advice. All processed on the backend — your data never leaves the server.
          </div>
        </div>
      </div>
    </div>
  );
}
