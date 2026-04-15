import { useState } from "react";
import { ArrowLeft, Brain, TrendingUp, BarChart3, PieChart, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCrossModuleInsights, Insight } from "../core/hooks/useCrossModuleInsights";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#38BDF8"; // Sky Blue for Intelligence

export default function IntelligenceScreen({ onBack }: { onBack: () => void }) {
  const { insights, loading } = useCrossModuleInsights();
  
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

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return '#EF4444';
      case 'positive': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle size={24} color="#EF4444" />;
      case 'positive': return <CheckCircle2 size={24} color="#10B981" />;
      default: return <Activity size={24} color="#3B82F6" />;
    }
  };

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
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>التحليل الذكي</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>INTELLIGENCE ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Productivity Score Hero */}
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", marginBottom: "32px", animation: "fadeInUp 0.6s ease-out", border: `1px solid ${ACCENT}30` }}>
           <p style={{ color: ACCENT, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", marginBottom: "12px" }}>OVERALL PERFORMANCE</p>
           {loading ? (
             <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px", color: "#94A3B8" }}>جاري تحليل البيانات...</h2>
           ) : (
             <>
               <h2 style={{ fontSize: "64px", fontWeight: 900, marginBottom: "8px", color: ACCENT }}>{insights.some(i => i.type === 'positive') ? '92%' : '75%'}</h2>
               <div style={{ fontSize: "18px", color: "#94A3B8", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                 {insights.length > 0 ? "يوجد بناءات ذكية جاهزة للمراجعة" : "أداء مستقر هذا الأسبوع"}
               </div>
             </>
           )}
        </div>

        {/* Real Dynamic Insights Grid */}
        <h3 style={{ fontSize: 20, marginBottom: 20, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الاستنتاجات الذكية (Cross-Module)</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>يقوم الذكاء الاصطناعي بربط المهام بالماليات...</div>
        ) : insights.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>لا توجد استنتاجات تحذيرية حالياً. استمر في أدائك الجيد!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
             {insights.map((insight, i) => (
               <div key={insight.id} className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: 20, animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`, borderRight: `4px solid ${getInsightColor(insight.type)}` }}>
                  <div style={{ width: 56, height: 56, borderRadius: "16px", background: `${getInsightColor(insight.type)}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                     {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Noto Kufi Arabic', sans-serif", color: "#FFF" }}>{insight.title}</div>
                    <div style={{ fontSize: 14, color: "#94A3B8", marginTop: 4, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{insight.description}</div>
                  </div>
               </div>
             ))}
          </div>
        )}

      </div>
    </div>
  );
}
