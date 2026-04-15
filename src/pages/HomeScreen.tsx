/**
 * HomeScreen — NEW (Home vertical slice, Phase 1)
 * Source: interface/itqan-home.jsx
 * Connected to: useHomeNew + home-adapter
 * Mock data: REMOVED
 * Deferred: quran/adhkar/study badges (Phase 2/3)
 */
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Moon, BookOpen, Star, GraduationCap, Briefcase,
  Wallet, Users, Heart, Calendar, Timer, Sparkles, ChevronRight,
  Flame, TrendingUp, Shield, Bell, Search, Command,
  Clock, LogOut, Droplets,
} from "lucide-react";
import { useHomeNew } from "../hooks/useHomeNew";
import {
  buildQuickStats,
  buildModuleBadges,
  buildGreeting,
  buildDisplayName,
  buildAvatarLetter,
} from "../lib/home-adapter";

// ── Constants ─────────────────────────────────────────────────

const BG = "#000E30";

interface ModuleDef {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: React.ElementType;
  color: string;
  desc: string;
  size: "large" | "normal";
  locked?: boolean;
}

const MODULES: ModuleDef[] = [
  { id: "dashboard", nameAr: "الرئيسية",  nameEn: "Dashboard", icon: LayoutDashboard, color: "#08A7E7", desc: "نظرة شاملة على يومك",         size: "large"  },
  { id: "salah",     nameAr: "الصلاة",    nameEn: "Salah",     icon: Moon,            color: "#A78BFA", desc: "مواقيت وتتبع الصلوات",         size: "normal" },
  { id: "quran",     nameAr: "القرآن",    nameEn: "Quran",     icon: BookOpen,        color: "#34D399", desc: "ختمة · حفظ · مراجعة",           size: "normal" },
  { id: "adhkar",    nameAr: "الأذكار",   nameEn: "Adhkar",    icon: Star,            color: "#FBBF24", desc: "أذكار الصباح والمساء",           size: "normal" },
  { id: "fasting",   nameAr: "الصيام",    nameEn: "Fasting",   icon: Droplets,        color: "#818CF8", desc: "الصيام · القضاء · النوافل",       size: "normal" },
  { id: "sibaq",     nameAr: "السباق",    nameEn: "Sibaq",     icon: Users,           color: "#F472B6", desc: "تنافس مع أصحابك",               size: "normal" },
  { id: "study",     nameAr: "الدراسة",   nameEn: "Study",     icon: GraduationCap,   color: "#60A5FA", desc: "المواد والامتحانات",             size: "normal" },
  { id: "work",      nameAr: "العمل",     nameEn: "Work",      icon: Briefcase,       color: "#FB923C", desc: "مهام · مشاريع · كورسات",         size: "normal" },
  { id: "finance",   nameAr: "الماليات",  nameEn: "Finance",   icon: Wallet,          color: "#4ADE80", desc: "ميزانية · زكاة · صدقات",         size: "normal", locked: true },
  { id: "lifestyle", nameAr: "الصحة",     nameEn: "Health",    icon: Heart,           color: "#F87171", desc: "عادات · نوم · تمارين · أكل",     size: "normal" },
  { id: "calendar",  nameAr: "التقويم",   nameEn: "Calendar",  icon: Calendar,        color: "#818CF8", desc: "هجري + ميلادي",                  size: "normal" },
  { id: "focus",     nameAr: "التركيز",   nameEn: "Focus",     icon: Timer,           color: "#FB923C", desc: "مؤقت البومودورو",                size: "normal" },
  { id: "coach",     nameAr: "المدرب",    nameEn: "AI Coach",  icon: Sparkles,        color: "#08A7E7", desc: "مدربك الذكي بالـ AI",            size: "normal" },
];

// ── Sub-components ────────────────────────────────────────────

function ItqanLogo({ size = 40 }: { size?: number }) {
  const petals = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <defs>
        <linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#08A7E7" />
          <stop offset="100%" stopColor="#065A8C" />
        </linearGradient>
        <radialGradient id="centerGlow">
          <stop offset="0%" stopColor="#08A7E7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#08A7E7" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse key={i} cx="40" cy="24" rx="6" ry="16" fill="url(#petalGrad)" opacity="0.7"
          transform={`rotate(${(i * 360) / petals} 40 40)`} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const rad = (i * Math.PI * 2) / 8;
        return <circle key={`d-${i}`} cx={40 + Math.cos(rad) * 32} cy={40 + Math.sin(rad) * 32} r="2.5" fill="#08A7E7" opacity="0.5" />;
      })}
      <circle cx="40" cy="40" r="12" fill="url(#centerGlow)" />
      <circle cx="40" cy="40" r="4" fill="#08A7E7" />
    </svg>
  );
}

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
        position: "relative", cursor: "pointer", overflow: "hidden",
        borderRadius: 16, padding: isLarge ? "28px 32px" : "22px 20px",
        background: hovered ? `${mod.color}0A` : "#0A1628",
        border: `1px solid ${hovered ? mod.color + "40" : "#0F2847"}`,
        transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        opacity: 0,
        animation: `cardIn 0.5s cubic-bezier(.4,0,.2,1) ${index * 0.05}s forwards`,
      }}
    >
      <div style={{
        position: "absolute", top: -40, right: -40, width: 120, height: 120,
        borderRadius: "50%", background: mod.color,
        opacity: hovered ? 0.06 : 0, transition: "opacity 0.4s", filter: "blur(40px)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: isLarge ? 16 : 12 }}>
          <div style={{
            width: isLarge ? 48 : 40, height: isLarge ? 48 : 40,
            borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            background: mod.color + "15", border: `1px solid ${mod.color}25`,
            boxShadow: hovered ? `0 0 20px ${mod.color}20` : "none", transition: "all 0.3s",
          }}>
            <mod.icon size={isLarge ? 22 : 18} color={mod.color} strokeWidth={1.8} />
          </div>

          {/* Live badge — only shown if data exists */}
          {badge && (
            <span style={{
              fontSize: 10, padding: "3px 10px", borderRadius: 20,
              background: mod.color + "12", color: mod.color,
              border: `1px solid ${mod.color}20`,
              fontFamily: "'Noto Kufi Arabic', sans-serif",
            }}>{badge}</span>
          )}
          {mod.locked && !badge && (
            <span style={{
              fontSize: 10, padding: "3px 10px", borderRadius: 20,
              background: "#FBBF2412", color: "#FBBF24", border: "1px solid #FBBF2420",
            }}>PIN</span>
          )}
        </div>

        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontSize: isLarge ? 22 : 17, fontWeight: 700,
            color: hovered ? mod.color : "#C0C8D8",
            fontFamily: "'Noto Kufi Arabic', sans-serif",
            transition: "color 0.3s", letterSpacing: "-0.3px",
          }}>{mod.nameAr}</span>
        </div>
        <div style={{
          fontSize: isLarge ? 12 : 11, color: "#3D5A80",
          fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
          letterSpacing: "1.5px", marginBottom: 6,
        }}>{mod.nameEn}</div>
        <p style={{
          fontSize: 12, color: "#4A6A8A", margin: 0, lineHeight: 1.5,
          fontFamily: "'Noto Kufi Arabic', sans-serif",
        }}>{mod.desc}</p>

        <div style={{
          position: "absolute", bottom: 0, right: 0,
          opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(-4px)",
          transition: "all 0.3s",
        }}>
          <ChevronRight size={16} color={mod.color} />
        </div>
      </div>
    </div>
  );
}

function QuickStatItem({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
      borderRadius: 10, background: "#0A1628", border: "1px solid #0F2847",
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: color + "10" }}>
        <Icon size={14} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#C0C8D8", fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
        <div style={{ fontSize: 10, color: "#3D5A80" }}>{label}</div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function HomeScreen({ onNavigate, onLogout }: { onNavigate?: (id: string) => void; onLogout?: () => void }) {
  const { profile, todayScore, shared, prayerLog, times, loading, timesLoading, error, refetch } = useHomeNew();

  const [searchFocused, setSearchFocused] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Build live data
  const quickStats  = buildQuickStats(todayScore, shared, times, prayerLog);
  const badges      = buildModuleBadges(times, prayerLog, shared);
  const greeting    = buildGreeting();
  const displayName = buildDisplayName(profile);
  const avatarLetter = buildAvatarLetter(profile);

  const handleModuleClick = (id: string) => {
    onNavigate?.(id);
  };

  // ── Error state ───────────────────────────────────────────
  if (error && !loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ color: "#F87171", fontFamily: "'Noto Kufi Arabic', sans-serif", fontSize: 15, textAlign: "center", maxWidth: 320 }}>{error}</div>
        <button onClick={refetch} style={{ padding: "8px 20px", borderRadius: 8, background: "#08A7E715", border: "1px solid #08A7E730", color: "#08A7E7", cursor: "pointer", fontSize: 13, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", color: "#C0C8D8", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rotateSlow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulseGlow { 0%,100%{opacity:0.03} 50%{opacity:0.07} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#0F2847; border-radius:2px; }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <svg style={{ position: "absolute", top: "50%", left: "50%", width: 900, height: 900, transform: "translate(-50%,-50%)", opacity: 0.02, animation: "rotateSlow 120s linear infinite" }} viewBox="0 0 400 400">
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1="200" y1="200" x2={200 + 180 * Math.cos((i * Math.PI * 2) / 24)} y2={200 + 180 * Math.sin((i * Math.PI * 2) / 24)} stroke="#08A7E7" strokeWidth="0.5" />
          ))}
          <circle cx="200" cy="200" r="120" fill="none" stroke="#08A7E7" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="180" fill="none" stroke="#08A7E7" strokeWidth="0.3" />
          <circle cx="200" cy="200" r="60"  fill="none" stroke="#08A7E7" strokeWidth="0.5" />
        </svg>
        <div style={{ position: "absolute", top: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "#08A7E7", animation: "pulseGlow 6s ease infinite", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: -200, left: -200, width: 400, height: 400, borderRadius: "50%", background: "#A78BFA", opacity: 0.03, filter: "blur(120px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>

        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", animation: "slideDown 0.6s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <ItqanLogo size={42} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                <span style={{ color: "#08A7E7" }}>إت</span><span style={{ color: "#C0C0C0" }}>قان</span>
              </div>
              <div style={{ fontSize: 10, color: "#3D5A80", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
                Life operating system
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
              borderRadius: 10, background: searchFocused ? "#0A162880" : "#0A1628",
              border: `1px solid ${searchFocused ? "#08A7E740" : "#0F2847"}`,
              transition: "all 0.3s", width: 220,
            }}>
              <Search size={14} color="#3D5A80" />
              <input
                placeholder="Search... (Ctrl+K)"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{ background: "none", border: "none", outline: "none", fontSize: 12, color: "#C0C8D8", width: "100%", fontFamily: "inherit" }}
              />
              <div style={{ padding: "2px 6px", borderRadius: 4, background: "#0F2847", fontSize: 10, color: "#3D5A80", fontFamily: "'JetBrains Mono', monospace" }}>
                <Command size={10} style={{ display: "inline", verticalAlign: "middle" }} /> K
              </div>
            </div>

            <div style={{ width: 1, height: 24, background: "#0F2847" }} />

            <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #0F2847", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <Bell size={15} color="#3D5A80" />
              <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#08A7E7" }} />
            </button>

            <button onClick={onLogout} title="تسجيل الخروج" style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #0F2847", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <LogOut size={15} color="#3D5A80" />
            </button>

            <div style={{ width: 1, height: 24, background: "#0F2847" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                {/* Live: displayName from profile */}
                <div style={{ fontSize: 13, fontWeight: 600, color: "#C0C8D8" }}>
                  {loading ? '...' : displayName}
                </div>
                {/* Live: rank from shared score */}
                <div style={{ fontSize: 10, color: "#08A7E7", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  {loading ? '...' : (shared?.rankTitle ?? '—')}
                </div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #08A7E720, #08A7E708)", border: "2px solid #08A7E730", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#08A7E7" }}>
                  {loading ? '?' : avatarLetter}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Greeting + Quick Stats */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8, marginBottom: 32, animation: "fadeIn 0.8s ease 0.2s both" }}>
          <div>
            <div style={{ fontSize: 14, color: "#3D5A80", marginBottom: 4, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              {greeting} يا {loading ? '...' : displayName}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#E8EBF0", fontFamily: "'Noto Kufi Arabic', sans-serif", letterSpacing: "-0.5px" }}>
              اختر وِجهتك اليوم
            </div>
            <div style={{ fontSize: 12, color: "#2A4A6A", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              {time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              {timesLoading && <span style={{ color: "#08A7E7", marginLeft: 8 }}>loading times...</span>}
            </div>
          </div>

          {/* Live quick stats */}
          <div style={{ display: "flex", gap: 10 }}>
            <QuickStatItem icon={Flame}      label="Streak"      value={loading ? '...' : quickStats.streak}     color="#FB923C" />
            <QuickStatItem icon={TrendingUp} label="Score"       value={loading ? '...' : quickStats.score}      color="#08A7E7" />
            <QuickStatItem icon={Clock}      label="Next prayer" value={loading ? '...' : quickStats.nextPrayer} color="#A78BFA" />
          </div>
        </div>

        {/* Module Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, paddingBottom: 60 }}>
          {MODULES.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              index={i}
              badge={badges[mod.id as keyof typeof badges] ?? null}
              onClick={handleModuleClick}
            />
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "12px 40px",
          background: "linear-gradient(transparent, #000E30E0 30%, #000E30)",
          display: "flex", justifyContent: "center", alignItems: "center", gap: 32,
          animation: "fadeIn 1s ease 0.8s both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#2A4A6A" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>All systems active</span>
          </div>
          <div style={{ width: 1, height: 12, background: "#0F2847" }} />
          <div style={{ fontSize: 11, color: "#2A4A6A", fontFamily: "'JetBrains Mono', monospace" }}>v2.0 — Itqan Life OS</div>
          <div style={{ width: 1, height: 12, background: "#0F2847" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#2A4A6A" }}>
            <Shield size={11} color="#2A4A6A" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Encrypted</span>
          </div>
        </div>
      </div>


    </div>
  );
}
