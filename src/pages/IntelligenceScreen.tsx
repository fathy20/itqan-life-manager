import { useState } from "react";
import { ArrowLeft, Brain, Activity, AlertCircle, CheckCircle2, DollarSign, Briefcase, Zap, TrendingUp, Lightbulb } from "lucide-react";
import { useCrossModuleInsights } from "../core/hooks/useCrossModuleInsights";
import { useIntelligenceNew } from "../hooks/useIntelligenceNew";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#38BDF8";

export default function IntelligenceScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (id: string) => void }) {
  const { insights: crossInsights, workSummary, financeSummary, loading: crossLoading } = useCrossModuleInsights();
  const { report, loading: reportLoading } = useIntelligenceNew();

  const loading = crossLoading || reportLoading;

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
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'positive': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getInsightIcon = (type: string, category: string) => {
    if (type === 'positive') return <CheckCircle2 size={24} color="#10B981" />;
    if (type === 'critical') return <AlertCircle size={24} color="#EF4444" />;
    
    if (category === 'finance') return <DollarSign size={24} color="#F59E0B" />;
    if (category === 'work') return <Briefcase size={24} color="#3B82F6" />;
    return <Activity size={24} color={getInsightColor(type)} />;
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
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", marginBottom: "32px", animation: "fadeInUp 0.6s ease-out", border: `1px solid ${ACCENT}30`, position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: 300, height: 300, background: ACCENT, filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }} />
           <p style={{ color: ACCENT, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", marginBottom: "12px" }}>OVERALL LIFE SCORE</p>
           {loading ? (
             <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px", color: "#94A3B8" }}>جاري مزامنة وتحليل البيانات...</h2>
           ) : (
             <>
               <h2 style={{ fontSize: "64px", fontWeight: 900, marginBottom: "8px", color: ACCENT }}>{report?.lifeScore ?? (crossInsights.some(i => i.type === 'positive') ? 85 : 70)}<span style={{ fontSize: 32, color: "#94A3B8" }}>/100</span></h2>
               <div style={{ fontSize: "18px", color: "#94A3B8", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                 {crossInsights.length > 0 ? "يوجد استنتاجات ذكية جاهزة للمراجعة بناءً على نشاطك" : "أداء مستقر في جميع الموديولات هذا الأسبوع"}
               </div>
             </>
           )}
        </div>

        {/* Global Summary Metrics (Work & Finance) */}
        {!loading && (workSummary || financeSummary) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32, animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
            {workSummary && (
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#3B82F615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={20} color="#3B82F6" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 16, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>أداء العمل</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>معدل الإنجاز</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9' }}>{workSummary.completionRate}%</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>مهام متأخرة</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: workSummary.lateTasks > 0 ? '#EF4444' : '#10B981' }}>{workSummary.lateTasks}</div>
                  </div>
                </div>
              </div>
            )}
            {financeSummary && (
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#10B98115', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={20} color="#10B981" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 16, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الصحة المالية</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>معدل الصرف</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: financeSummary.expenseRatio > 0.8 ? '#EF4444' : '#F1F5F9' }}>{Math.round(financeSummary.expenseRatio * 100)}%</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>الرصيد المتاح</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: financeSummary.balance >= 0 ? '#10B981' : '#EF4444' }}>{financeSummary.balance.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real Dynamic Insights Grid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Lightbulb size={24} color={ACCENT} />
          <h3 style={{ margin: 0, fontSize: 20, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الاستنتاجات والتوصيات الذكية</h3>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>يقوم محرك الذكاء بتحليل البيانات المشتركة...</div>
        ) : crossInsights.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>لا توجد استنتاجات حالياً. استمر في أدائك الجيد!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
             {crossInsights.map((insight, i) => (
               <div key={insight.id} className="glass-card" style={{ padding: "24px", display: "flex", gap: 20, alignItems: 'flex-start', animation: `fadeInUp 0.5s ease-out ${0.2 + (i * 0.1)}s both`, borderRight: `4px solid ${getInsightColor(insight.type)}` }}>
                  <div style={{ width: 56, height: 56, borderRadius: "16px", background: `${getInsightColor(insight.type)}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                     {getInsightIcon(insight.type, insight.category)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Noto Kufi Arabic', sans-serif", color: "#FFF" }}>{insight.title}</div>
                      {insight.metric && (
                        <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 12 }}>
                          <div style={{ fontSize: 10, color: '#94A3B8' }}>{insight.metric.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 'bold' }}>{insight.metric.value}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: "#94A3B8", marginTop: 8, fontFamily: "'Noto Kufi Arabic', sans-serif", lineHeight: 1.6 }}>{insight.description}</div>
                    
                    {insight.actionable && insight.actionLabel && (
                      <button
                        onClick={() => { if (insight.actionPath) onNavigate?.(insight.actionPath); }}
                        style={{ 
                        marginTop: 16, padding: '8px 16px', borderRadius: 8, background: `${getInsightColor(insight.type)}20`,
                        border: `1px solid ${getInsightColor(insight.type)}40`, color: getInsightColor(insight.type),
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Kufi Arabic', sans-serif"
                      }}>
                        {insight.actionLabel}
                      </button>
                    )}
                  </div>
               </div>
             ))}
          </div>
        )}

      </div>
    </div>
  );
}
