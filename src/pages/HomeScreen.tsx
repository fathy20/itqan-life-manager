import { useState, useEffect } from "react";
import {
  LayoutDashboard, Moon, BookOpen, Star, GraduationCap, Briefcase,
  Wallet, Users, Heart, Calendar, Timer, Sparkles, ChevronRight,
  Flame, TrendingUp, Shield, Bell, Search, Command,
  Clock, LogOut, Droplets, Trophy, Zap
} from "lucide-react";
import { useHomeNew } from "../hooks/useHomeNew";
import {
  buildQuickStats,
  buildModuleBadges,
  buildGreeting,
  buildDisplayName,
  buildAvatarLetter,
} from "../lib/home-adapter";

// ── Constants ──
const BG = "#020617"; // Rich deep slate/navy
const CARD_BG = "rgba(15, 23, 42, 0.6)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";

interface ModuleDef {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: React.ElementType;
  color: string;
  glow: string;
  desc: string;
  size: "large" | "normal";
  status?: string;
}

const MODULES: ModuleDef[] = [
  { id: "salah",     nameAr: "الصلاة",    nameEn: "Salah",     icon: Moon,            color: "#8B5CF6", glow: "rgba(139, 92, 246, 0.4)", desc: "مواقيت وتتبع الصلوات",         size: "normal" },
  { id: "quran",     nameAr: "القرآن",    nameEn: "Quran",     icon: BookOpen,        color: "#10B981", glow: "rgba(16, 185, 129, 0.4)", desc: "ختمة · حفظ · مراجعة",           size: "normal" },
  { id: "adhkar",    nameAr: "الأذكار",   nameEn: "Adhkar",    icon: Star,            color: "#F59E0B", glow: "rgba(245, 158, 11, 0.4)", desc: "أذكار الصباح والمساء",           size: "normal" },
  { id: "fasting",   nameAr: "الصيام",    nameEn: "Fasting",   icon: Droplets,        color: "#3B82F6", glow: "rgba(59, 130, 246, 0.4)", desc: "الصيام · القضاء · النوافل",       size: "normal" },
  { id: "study",     nameAr: "الدراسة",   nameEn: "Study",     icon: GraduationCap,   color: "#6366F1", glow: "rgba(99, 102, 241, 0.4)", desc: "المواد والامتحانات",             size: "normal" },
  { id: "work",      nameAr: "العمل",     nameEn: "Work",      icon: Briefcase,       color: "#F97316", glow: "rgba(249, 115, 22, 0.4)", desc: "مهام · مشاريع · كورسات",         size: "normal" },
  { id: "finance",   nameAr: "الماليات",  nameEn: "Finance",   icon: Wallet,          color: "#22C55E", glow: "rgba(34, 197, 94, 0.4)", desc: "ميزانية · زكاة · صدقات",         size: "normal" },
  { id: "lifestyle", nameAr: "الصحة",     nameEn: "Health",    icon: Heart,           color: "#EF4444", glow: "rgba(239, 68, 68, 0.4)", desc: "عادات · نوم · تمارين · أكل",     size: "normal" },
  { id: "focus",     nameAr: "التركيز",   nameEn: "Focus",     icon: Timer,           color: "#EC4899", glow: "rgba(236, 72, 153, 0.4)", desc: "مؤقت البومودورو",                size: "normal" },
  { id: "sibaq",     nameAr: "السباق",    nameEn: "Sibaq",     icon: Trophy,          color: "#F472B6", glow: "rgba(244, 114, 182, 0.4)", desc: "تنافس مع أصحابك",               size: "normal" },
  { id: "coach",     nameAr: "المدرب",    nameEn: "AI Coach",  icon: Sparkles,        color: "#06B6D4", glow: "rgba(6, 182, 212, 0.4)", desc: "مدربك الذكي بالـ AI",            size: "large" },
  { id: "intelligence", nameAr: "الذكاء", nameEn: "Insights",  icon: TrendingUp,      color: "#0EA5E9", glow: "rgba(14, 165, 233, 0.4)", desc: "تحليلات الأداء الشاملة",         size: "normal" },
];

function ModuleCard({
  mod, index, badge, onClick,
}: {
  mod: ModuleDef;
  index: number;
  badge: string | null;
  onClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isLarge = mod.size === "large";

  return (
    <div
      onClick={() => onClick(mod.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: isLarge ? "span 2" : "span 1",
        position: "relative",
        cursor: "pointer",
        borderRadius: "24px",
        padding: isLarge ? "32px" : "24px",
        background: hovered ? "rgba(30, 41, 59, 0.7)" : CARD_BG,
        border: `1px solid ${hovered ? mod.color : BORDER_COLOR}`,
        backdropFilter: "blur(12px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered ? `0 20px 40px -15px ${mod.glow}` : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
      }}
    >
      {/* Abstract Background pattern */}
      <div style={{
        position: "absolute",
        top: -20,
        right: -20,
        opacity: hovered ? 0.2 : 0.05,
        transition: "opacity 0.4s",
      }}>
        <mod.icon size={120} color={mod.color} strokeWidth={1} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${mod.color}20, ${mod.color}40)`,
            border: `1px solid ${mod.color}30`,
            boxShadow: hovered ? `0 0 20px ${mod.color}40` : "none",
            transition: "all 0.3s",
          }}>
            <mod.icon size={24} color={mod.color} strokeWidth={2} />
          </div>
          {badge && (
            <div style={{
              padding: "4px 12px",
              borderRadius: "12px",
              background: `${mod.color}20`,
              color: mod.color,
              fontSize: "11px",
              fontWeight: 700,
              border: `1px solid ${mod.color}30`,
              fontFamily: "'Noto Kufi Arabic', sans-serif"
            }}>
              {badge}
            </div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <h3 style={{
            fontSize: isLarge ? "24px" : "20px",
            fontWeight: 800,
            marginBottom: "4px",
            color: "#F8FAFC",
            fontFamily: "'Noto Kufi Arabic', sans-serif"
          }}>{mod.nameAr}</h3>
          <p style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: mod.color,
            fontWeight: 600,
            marginBottom: "12px",
            fontFamily: "'JetBrains Mono', monospace"
          }}>{mod.nameEn}</p>
          <p style={{
            fontSize: "13px",
            color: "#94A3B8",
            lineHeight: 1.6,
            fontFamily: "'Noto Kufi Arabic', sans-serif"
          }}>{mod.desc}</p>
        </div>
      </div>

      <div style={{
        marginTop: "20px",
        height: "2px",
        width: hovered ? "100%" : "0%",
        background: mod.color,
        transition: "width 0.4s ease",
        borderRadius: "2px",
      }} />
    </div>
  );
}

export default function HomeScreen({ onNavigate, onLogout }: { onNavigate?: (id: string) => void; onLogout?: () => void }) {
  const { profile, todayScore, shared, prayerLog, times, loading, error, refetch } = useHomeNew();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const quickStats  = buildQuickStats(todayScore, shared, times, prayerLog);
  const badges      = buildModuleBadges(times, prayerLog, shared);
  const greeting    = buildGreeting();
  const displayName = buildDisplayName(profile);
  const avatarLetter = buildAvatarLetter(profile);

  if (error && !loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <p style={{ color: "#EF4444", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>عذراً، حدث خطأ في التحميل</p>
        <button onClick={refetch} style={{ padding: "10px 24px", borderRadius: "12px", background: "#3B82F6", color: "white", border: "none", cursor: "pointer" }}>إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      color: "#F1F5F9",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      paddingBottom: "100px",
      overflowX: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Kufi+Arabic:wght@400;700;900&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet" />
      
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        body { margin: 0; background: ${BG}; }
        .grid-bg {
          position: fixed; inset: 0;
          background-image: radial-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
      `}</style>

      <div className="grid-bg" />

      {/* Decorative Orbs */}
      <div style={{ position: "fixed", top: "-10%", right: "-5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-10%", left: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative" }}>
        
        {/* Header */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "32px 0",
          animation: "fadeInUp 0.8s ease-out"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 16px -4px rgba(59, 130, 246, 0.5)"
            }}>
              <LayoutDashboard color="white" size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px", margin: 0 }}>
                <span style={{ color: "#3B82F6" }}>ITQAN</span> LIFE <span style={{ color: "#64748B", fontWeight: 400 }}>OS</span>
              </h1>
              <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "3px", color: "#64748B", marginTop: "2px" }}>System v2.0</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>{loading ? "..." : displayName}</p>
              <p style={{ fontSize: "11px", color: "#3B82F6", fontWeight: 600, margin: 0 }}>{shared?.rankTitle || "Mubtadi'"}</p>
            </div>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: "linear-gradient(135deg, #1E293B, #0F172A)",
              border: "2px solid #334155",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", fontWeight: 700, color: "#3B82F6"
            }}>
              {avatarLetter}
            </div>
            <button onClick={onLogout} style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s"
            }}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ marginBottom: "48px", animation: "fadeInUp 0.8s ease-out 0.1s both" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
            borderRadius: "32px",
            padding: "40px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: "0 20px 50px -12px rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "32px"
          }}>
            <div>
              <p style={{ color: "#3B82F6", fontWeight: 700, fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>Dashboard Overview</p>
              <h2 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "12px", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                {greeting}، {displayName} 
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#94A3B8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                  <Calendar size={16} />
                  <span>{time.toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#F8FAFC" }}>{time.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "24px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#F59E0B", marginBottom: "4px" }}><Flame size={24} /></div>
                <div style={{ fontSize: "24px", fontWeight: 800 }}>{quickStats.streak}</div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#64748B", letterSpacing: "1px" }}>Days Streak</div>
              </div>
              <div style={{ width: "1px", background: BORDER_COLOR }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#3B82F6", marginBottom: "4px" }}><Zap size={24} /></div>
                <div style={{ fontSize: "24px", fontWeight: 800 }}>{quickStats.score}</div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#64748B", letterSpacing: "1px" }}>Life Score</div>
              </div>
              <div style={{ width: "1px", background: BORDER_COLOR }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#8B5CF6", marginBottom: "4px" }}><Clock size={24} /></div>
                <div style={{ fontSize: "24px", fontWeight: 800 }}>{quickStats.nextPrayer}</div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#64748B", letterSpacing: "1px" }}>Next Prayer</div>
              </div>
            </div>
          </div>
        </section>

        {/* Modules Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "24px",
          paddingBottom: "100px"
        }}>
          {MODULES.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              index={i}
              badge={badges[mod.id as keyof typeof badges] ?? null}
              onClick={(id) => onNavigate?.(id)}
            />
          ))}
        </div>
      </div>

      {/* Footer Navigation (Glassmorphism Bottom Navbar) */}
      <nav style={{
        position: "fixed",
        bottom: "32px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        padding: "12px 32px",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        gap: "40px",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
        zIndex: 100,
        animation: "fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both"
      }}>
        <button onClick={() => onNavigate?.('dashboard')} style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer" }}><LayoutDashboard size={24} /></button>
        <button onClick={() => onNavigate?.('coach')} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><Sparkles size={24} /></button>
        <button onClick={() => onNavigate?.('intelligence')} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><TrendingUp size={24} /></button>
        <button onClick={() => onNavigate?.('sibaq')} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><Trophy size={24} /></button>
      </nav>
    </div>
  );
}
