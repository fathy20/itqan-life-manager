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
  Clock, LogOut, Droplets
} from "lucide-react";
import { useHomeNew } from "../hooks/useHomeNew";
import { useAppStore } from "../core/store/useAppStore";
import { useCrossModuleInsights } from "../core/hooks/useCrossModuleInsights";
import {
  buildQuickStats,
  buildModuleBadges,
  buildGreeting,
  buildDisplayName,
  buildAvatarLetter,
} from "../lib/home-adapter";

// ── Constants ─────────────────────────────────────────────────

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
  { id: "intelligence", nameAr: "التحليل الذكي",  nameEn: "INTELLIGENCE", icon: LayoutDashboard, color: "#0ea5e9", desc: "تحليلات الأداء والتقدم بالذكاء الاصطناعي",         size: "large"  },
  { id: "salah",     nameAr: "الصلاة",    nameEn: "Salah",     icon: Moon,            color: "#8b5cf6", desc: "مواقيت وتتبع الصلوات",         size: "normal" },
  { id: "quran",     nameAr: "القرآن",    nameEn: "Quran",     icon: BookOpen,        color: "#10b981", desc: "ختمة · حفظ · مراجعة",           size: "normal" },
  { id: "adhkar",    nameAr: "الأذكار",   nameEn: "Adhkar",    icon: Star,            color: "#f59e0b", desc: "أذكار الصباح والمساء",           size: "normal" },
  { id: "fasting",   nameAr: "الصيام",    nameEn: "Fasting",   icon: Droplets,        color: "#6366f1", desc: "الصيام · القضاء · النوافل",       size: "normal" },
  { id: "sibaq",     nameAr: "السباق",    nameEn: "Sibaq",     icon: Users,           color: "#ec4899", desc: "تنافس مع أصحابك",               size: "normal" },
  { id: "study",     nameAr: "الدراسة",   nameEn: "Study",     icon: GraduationCap,   color: "#3b82f6", desc: "المواد والامتحانات",             size: "normal" },
  { id: "work",      nameAr: "العمل",     nameEn: "Work",      icon: Briefcase,       color: "#f97316", desc: "مهام · مشاريع · كورسات",         size: "normal" },
  { id: "finance",   nameAr: "الماليات",  nameEn: "Finance",   icon: Wallet,          color: "#22c55e", desc: "ميزانية · زكاة · صدقات",         size: "normal", locked: true },
  { id: "lifestyle", nameAr: "الصحة",     nameEn: "Health",    icon: Heart,           color: "#ef4444", desc: "عادات · نوم · تمارين · أكل",     size: "normal" },
  { id: "calendar",  nameAr: "التقويم",   nameEn: "Calendar",  icon: Calendar,        color: "#6366f1", desc: "هجري + ميلادي",                  size: "normal" },
  { id: "focus",     nameAr: "التركيز",   nameEn: "Focus",     icon: Timer,           color: "#f97316", desc: "مؤقت البومودورو",                size: "normal" },
  { id: "coach",     nameAr: "المدرب",    nameEn: "AI Coach",  icon: Sparkles,        color: "#0ea5e9", desc: "مدربك الذكي بالـ AI",            size: "normal" },
];

// ── Sub-components ────────────────────────────────────────────

function ItqanLogo({ size = 40 }: { size?: number }) {
  const petals = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="animate-pulse-soft">
      <defs>
        <linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <radialGradient id="centerGlow">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse key={i} cx="40" cy="24" rx="6" ry="16" fill="url(#petalGrad)" opacity="0.7"
          transform={`rotate(${(i * 360) / petals} 40 40)`} />
      ))}
      <circle cx="40" cy="40" r="12" fill="url(#centerGlow)" />
      <circle cx="40" cy="40" r="4" fill="#38bdf8" />
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
  const isLarge = mod.size === "large";

  return (
    <div
      onClick={() => onClick(mod.id)}
      className={`glass-card glass-card-hover group ${isLarge ? 'p-8 col-span-1 sm:col-span-2' : 'p-6 col-span-1'} animate-slide-up`}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
    >
      {/* Background glow specific to module color */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
        style={{ background: mod.color }} 
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className={`flex items-start justify-between ${isLarge ? 'mb-6' : 'mb-4'}`}>
          <div 
            className={`flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-lg ${isLarge ? 'w-14 h-14' : 'w-12 h-12'}`}
            style={{ boxShadow: `0 4px 20px -5px ${mod.color}20` }}
          >
            <mod.icon size={isLarge ? 26 : 22} color={mod.color} strokeWidth={1.8} className="group-hover:scale-110 transition-transform duration-500" />
          </div>

          {badge && (
            <span 
              className="text-[10px] px-3 py-1 rounded-full font-medium"
              style={{ background: `${mod.color}15`, color: mod.color, border: `1px solid ${mod.color}30` }}
            >
              {badge}
            </span>
          )}
          {mod.locked && !badge && (
            <span className="text-[10px] px-3 py-1 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              PIN
            </span>
          )}
        </div>

        <div>
          <h3 
            className={`font-bold transition-colors duration-300 tracking-tight ${isLarge ? 'text-2xl' : 'text-lg'}`}
            style={{ color: '#E2E8F0' }}
          >
            <span className="group-hover:text-transparent group-hover:bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${mod.color}, #ffffff)` }}>
              {mod.nameAr}
            </span>
          </h3>
          <div className={`font-mono uppercase tracking-[0.15em] text-slate-400 mt-1 mb-2 ${isLarge ? 'text-xs' : 'text-[10px]'}`}>
            {mod.nameEn}
          </div>
          <p className="text-xs text-slate-400/80 leading-relaxed font-normal">
            {mod.desc}
          </p>
        </div>

        <div className="absolute bottom-6 right-6 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ChevronRight size={18} color={mod.color} />
        </div>
      </div>
    </div>
  );
}

function QuickStatItem({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="glass-card flex items-center gap-3 px-4 py-3 border border-slate-700/50 hover:border-slate-600 transition-colors w-full sm:w-auto">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5" style={{ boxShadow: `0 0 15px -5px ${color}30` }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div className="text-base font-bold text-slate-200 font-mono leading-none">{value}</div>
        <div className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function HomeScreen({ onNavigate, onLogout }: { onNavigate?: (id: string) => void; onLogout?: () => void }) {
  const { profile, todayScore, shared, prayerLog, times, loading, timesLoading, error, refetch } = useHomeNew();

  const [searchFocused, setSearchFocused] = useState(false);
  const { insights, dailyBrief } = useCrossModuleInsights();
  const [time, setTime] = useState(new Date());
  
  const notifications = useAppStore(s => s.notifications);
  const markNotificationRead = useAppStore(s => s.markNotificationRead);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [showNotifs, setShowNotifs] = useState(false);

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

  if (error && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="text-red-400 text-sm text-center max-w-xs">{error}</div>
        <button onClick={refetch} className="premium-btn px-6 py-2">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-500/10 blur-[120px] mix-blend-screen animate-pulse-soft" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-screen animate-float" />
        <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-purple-500/5 blur-[100px] mix-blend-screen" />
      </div>
    
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10">

        {/* Top Navigation */}
        <header className="flex items-center justify-between py-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <ItqanLogo size={46} />
            <div>
              <h1 className="text-2xl font-black tracking-tighter">
                <span className="text-sky-500">إت</span><span className="text-slate-200">قان</span>
              </h1>
              <div className="text-[10px] text-slate-400 tracking-[0.2em] uppercase font-mono mt-0.5">
                Life Operating System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${searchFocused ? 'bg-slate-800/80 ring-1 ring-sky-500/50' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50'} backdrop-blur-md w-64`}>
              <Search size={16} className="text-slate-400" />
              <input
                placeholder="Search OS... (Ctrl+K)"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-500"
              />
              <div className="px-1.5 py-0.5 rounded md bg-slate-700/50 text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                <Command size={10} /> K
              </div>
            </div>

            <div className="w-px h-8 bg-slate-700/50 hidden md:block" />

            <div className="relative">
              <button 
                onClick={() => setShowNotifs(v => !v)} 
                className="w-10 h-10 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 flex items-center justify-center transition-all relative"
              >
                <Bell size={18} className="text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-slate-900" />
                )}
              </button>
              
              {showNotifs && (
                <div className="absolute top-12 right-0 w-80 max-h-[400px] overflow-y-auto glass-panel rounded-2xl p-2 z-50 animate-slide-up">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">لا توجد إشعارات</div>
                  ) : notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)} 
                      className={`p-3 rounded-xl cursor-pointer mb-1 transition-colors ${n.read ? 'hover:bg-white/5' : 'bg-sky-500/10 border border-sky-500/20'}`}
                    >
                      <div className="text-sm font-bold text-slate-200 mb-1">{n.title}</div>
                      <div className="text-xs text-slate-400 leading-relaxed">{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={onLogout} 
              className="w-10 h-10 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 hover:text-red-400 border border-slate-700/50 flex items-center justify-center transition-all text-slate-300"
            >
              <LogOut size={18} />
            </button>

            <div className="w-px h-8 bg-slate-700/50 hidden md:block" />

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-200">
                  {loading ? '...' : displayName}
                </div>
                <div className="text-[11px] text-sky-400 font-medium">
                  {loading ? '...' : (shared?.rankTitle ?? '—')}
                </div>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                <span className="text-lg font-black premium-gradient-text">
                  {loading ? '?' : avatarLetter}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between mt-8 mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div>
            <div className="text-lg text-slate-400 mb-2 font-medium">
              {greeting} يا <span className="premium-gradient-text font-black">{loading ? '...' : displayName}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              اختر وِجهتك اليوم
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="text-sm text-slate-400 font-mono bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                {time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </div>
              {timesLoading && <span className="text-sky-500 text-xs animate-pulse">يتم تحديث المواقيت...</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 md:mt-0">
            <QuickStatItem icon={Flame}      label="Streak"      value={loading ? '...' : quickStats.streak}     color="#f97316" />
            <QuickStatItem icon={TrendingUp} label="Score"       value={loading ? '...' : quickStats.score}      color="#0ea5e9" />
            <QuickStatItem icon={Clock}      label="Next prayer" value={loading ? '...' : quickStats.nextPrayer} color="#a855f7" />
          </div>
        </section>

        
        {/* Daily Brief */}
        {dailyBrief && (dailyBrief.insights.length > 0 || dailyBrief.todayTaskCount > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
            
            {/* AI Insights Card */}
            {dailyBrief.insights.length > 0 && (
              <div className="glass-card lg:col-span-2 p-6 flex flex-col sm:flex-row gap-5 items-start border-l-4 border-l-sky-500">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
                  <Sparkles className="text-sky-400" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-100 mb-2">محرك الذكاء الاصطناعي</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {dailyBrief.insights[0].description}
                  </p>
                  {dailyBrief.insights[0].actionable && (
                    <button 
                      onClick={() => handleModuleClick(dailyBrief.insights[0].actionPath || "intelligence")} 
                      className="premium-btn px-5 py-2 text-sm inline-flex items-center gap-2"
                    >
                      {dailyBrief.insights[0].actionLabel || 'اتخذ إجراء'} <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Daily Work Summary Card */}
            {dailyBrief.workSummary && (
              <div className="glass-card p-6 flex flex-col justify-center">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Briefcase size={16} className="text-orange-400" /> مهام اليوم
                </h3>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-5xl font-black text-white leading-none">
                    {dailyBrief.todayDoneCount}<span className="text-2xl text-slate-500">/{dailyBrief.todayTaskCount + dailyBrief.todayDoneCount}</span>
                  </div>
                  {dailyBrief.urgentCount > 0 && (
                    <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-bold animate-pulse-soft">
                      {dailyBrief.urgentCount} متأخرة
                    </div>
                  )}
                </div>
                {dailyBrief.todayTaskCount + dailyBrief.todayDoneCount > 0 && (
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${(dailyBrief.todayDoneCount / (dailyBrief.todayTaskCount + dailyBrief.todayDoneCount)) * 100}%` }} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

      </div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent flex justify-center items-center gap-6 z-50 pointer-events-none">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          System Online
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-700" />
        <div className="text-xs text-slate-500 font-mono">v2.1 — Atlas Edition</div>
        <div className="w-1 h-1 rounded-full bg-slate-700" />
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <Shield size={12} className="text-slate-500" />
          Secured
        </div>
      </div>

    </div>
  );
}
