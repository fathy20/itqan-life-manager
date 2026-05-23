import { useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Command,
  Droplets,
  Flame,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Shield,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useHomeNew } from "../hooks/useHomeNew";
import { useAppStore } from "../core/store/useAppStore";
import { useCrossModuleInsights } from "../core/hooks/useCrossModuleInsights";
import {
  buildAvatarLetter,
  buildDisplayName,
  buildGreeting,
  buildModuleBadges,
  buildQuickStats,
} from "../lib/home-adapter";

interface ModuleDef {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: ElementType;
  color: string;
  desc: string;
  size: "wide" | "normal";
  locked?: boolean;
}

const MODULES: ModuleDef[] = [
  { id: "intelligence", nameAr: "التحليل الذكي", nameEn: "Intelligence", icon: LayoutDashboard, color: "#38bdf8", desc: "نظرة مركزة على الأداء، الضغط، والأولويات القادمة.", size: "wide" },
  { id: "salah", nameAr: "الصلاة", nameEn: "Salah", icon: Moon, color: "#a78bfa", desc: "مواقيت، متابعة، وتنبيهات.", size: "normal" },
  { id: "quran", nameAr: "القرآن", nameEn: "Quran", icon: BookOpen, color: "#34d399", desc: "ختمة، حفظ، ومراجعة.", size: "normal" },
  { id: "adhkar", nameAr: "الأذكار", nameEn: "Adhkar", icon: Star, color: "#fbbf24", desc: "أذكار الصباح والمساء.", size: "normal" },
  { id: "fasting", nameAr: "الصيام", nameEn: "Fasting", icon: Droplets, color: "#818cf8", desc: "النوافل، القضاء، والخطة الشهرية.", size: "normal" },
  { id: "sibaq", nameAr: "السباق", nameEn: "Sibaq", icon: Users, color: "#f472b6", desc: "تنافس هادف مع أصحابك.", size: "normal" },
  { id: "study", nameAr: "الدراسة", nameEn: "Study", icon: GraduationCap, color: "#60a5fa", desc: "مواد، محاضرات، وامتحانات.", size: "normal" },
  { id: "work", nameAr: "العمل", nameEn: "Work", icon: Briefcase, color: "#fb923c", desc: "مهام، مشاريع، وكورسات.", size: "normal" },
  { id: "finance", nameAr: "الماليات", nameEn: "Finance", icon: Wallet, color: "#22c55e", desc: "ميزانية، التزامات، وأهداف.", size: "normal", locked: true },
  { id: "lifestyle", nameAr: "الصحة", nameEn: "Health", icon: Heart, color: "#f87171", desc: "نوم، عادات، تمرين، وأكل.", size: "normal" },
  { id: "calendar", nameAr: "التقويم", nameEn: "Calendar", icon: Calendar, color: "#818cf8", desc: "هجري وميلادي في مكان واحد.", size: "normal" },
  { id: "focus", nameAr: "التركيز", nameEn: "Focus", icon: Timer, color: "#fb923c", desc: "جلسات تركيز وراحة محسوبة.", size: "normal" },
  { id: "coach", nameAr: "المدرب", nameEn: "AI Coach", icon: Sparkles, color: "#38bdf8", desc: "مراجعة ذكية واقتراحات عملية.", size: "normal" },
];

function ItqanLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-lg border border-sky-400/25 bg-sky-400/10 shadow-[0_0_28px_rgba(56,189,248,0.12)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Sparkles size={Math.round(size * 0.46)} className="text-sky-300" strokeWidth={1.8} />
    </div>
  );
}

function QuickStatItem({ icon: Icon, label, value, color }: {
  icon: ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass-card flex min-w-[150px] items-center gap-3 px-4 py-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04]" style={{ color }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-base font-bold leading-none text-slate-100">{value}</div>
        <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function ModuleCard({
  mod,
  index,
  badge,
  onClick,
}: {
  mod: ModuleDef;
  index: number;
  badge: string | null;
  onClick: (id: string) => void;
}) {
  const isWide = mod.size === "wide";

  return (
    <button
      type="button"
      onClick={() => onClick(mod.id)}
      className={`glass-card glass-card-hover group min-h-[168px] text-right outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 ${
        isWide ? "p-6 sm:col-span-2" : "p-5"
      } animate-slide-up`}
      style={{ animationDelay: `${index * 35}ms`, animationFillMode: "both" }}
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04]" style={{ color: mod.color }}>
            <mod.icon size={22} strokeWidth={1.8} />
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="rounded-md border px-2.5 py-1 text-[10px] font-bold" style={{ color: mod.color, borderColor: `${mod.color}40`, background: `${mod.color}12` }}>
                {badge}
              </span>
            )}
            {mod.locked && !badge && (
              <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                قريبًا
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className={`${isWide ? "text-2xl" : "text-lg"} font-black tracking-tight text-slate-100`}>{mod.nameAr}</h3>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{mod.nameEn}</div>
            </div>
            <ChevronRight className="mb-1 shrink-0 translate-x-1 text-slate-600 transition group-hover:translate-x-0" size={18} />
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-400">{mod.desc}</p>
        </div>
      </div>
    </button>
  );
}

export default function HomeScreen({ onNavigate, onLogout }: { onNavigate?: (id: string) => void; onLogout?: () => void }) {
  const { profile, todayScore, shared, prayerLog, times, loading, timesLoading, error, refetch } = useHomeNew();
  const [searchFocused, setSearchFocused] = useState(false);
  const { dailyBrief } = useCrossModuleInsights();
  const [time, setTime] = useState(new Date());

  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const quickStats = buildQuickStats(todayScore, shared, times, prayerLog);
  const badges = buildModuleBadges(times, prayerLog, shared);
  const greeting = buildGreeting();
  const displayName = buildDisplayName(profile);
  const avatarLetter = buildAvatarLetter(profile);

  const handleModuleClick = (id: string) => onNavigate?.(id);

  if (error && !loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background px-6 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 text-center">
          <ItqanLogo />
          <h1 className="text-2xl font-black">تعذر تحميل البيانات</h1>
          <p className="text-sm leading-7 text-slate-400">{error}</p>
          <button onClick={refetch} className="premium-btn px-6 py-2.5 text-sm">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen overflow-hidden bg-background pb-16 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_34%)]" />

      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        <header className="flex items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <ItqanLogo />
            <div>
              <h1 className="text-2xl font-black tracking-tight"><span className="text-sky-300">إت</span>قان</h1>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Life Operating System</div>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className={`hidden w-64 items-center gap-2 rounded-lg border px-3 py-2 transition md:flex ${searchFocused ? "border-sky-400/50 bg-slate-900/80" : "border-white/10 bg-white/[0.03]"}`}>
              <Search size={16} className="text-slate-500" />
              <input placeholder="بحث سريع..." onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" />
              <span className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-500"><Command size={10} /> K</span>
            </div>

            <div className="relative">
              <button type="button" onClick={() => setShowNotifs((v) => !v)} className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06]" aria-label="الإشعارات">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-slate-950" />}
              </button>

              {showNotifs && (
                <div className="glass-panel absolute left-0 top-12 z-50 max-h-[390px] w-80 overflow-y-auto rounded-lg p-2">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">مفيش إشعارات حاليًا</div>
                  ) : (
                    notifications.map((n) => (
                      <button type="button" key={n.id} onClick={() => markNotificationRead(n.id)} className={`mb-1 w-full rounded-lg p-3 text-right transition ${n.read ? "hover:bg-white/[0.04]" : "border border-sky-400/20 bg-sky-400/10"}`}>
                        <div className="mb-1 text-sm font-bold text-slate-100">{n.title}</div>
                        <div className="text-xs leading-6 text-slate-400">{n.message}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button type="button" onClick={onLogout} className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-red-400/10 hover:text-red-300" aria-label="تسجيل الخروج">
              <LogOut size={18} />
            </button>

            <div className="hidden items-center gap-3 border-r border-white/10 pr-3 sm:flex">
              <div className="text-left">
                <div className="text-sm font-bold text-slate-100">{loading ? "..." : displayName}</div>
                <div className="text-[11px] font-semibold text-sky-300">{loading ? "..." : shared?.rankTitle ?? "عضو نشط"}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-sky-400/25 bg-sky-400/10 text-lg font-black text-sky-200">
                {loading ? "؟" : avatarLetter}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-3 text-base font-semibold text-slate-400">{greeting} يا <span className="text-sky-300">{loading ? "..." : displayName}</span></div>
            <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-50 md:text-5xl">ركّز على اللي يهمك النهارده.</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">{time.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              {timesLoading && <span className="text-xs text-sky-300">جاري تحديث المواقيت...</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <QuickStatItem icon={Flame} label="Streak" value={loading ? "..." : quickStats.streak} color="#fb923c" />
            <QuickStatItem icon={TrendingUp} label="Score" value={loading ? "..." : quickStats.score} color="#38bdf8" />
            <QuickStatItem icon={Clock} label="Next prayer" value={loading ? "..." : quickStats.nextPrayer} color="#a78bfa" />
          </div>
        </section>

        {dailyBrief && (dailyBrief.insights.length > 0 || dailyBrief.todayTaskCount > 0) && (
          <section className="mb-8 grid gap-4 lg:grid-cols-3">
            {dailyBrief.insights.length > 0 && (
              <div className="glass-card p-5 lg:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300"><Sparkles size={22} /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black text-slate-100">ملخص ذكي</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{dailyBrief.insights[0].description}</p>
                    {dailyBrief.insights[0].actionable && (
                      <button type="button" onClick={() => handleModuleClick(dailyBrief.insights[0].actionPath || "intelligence")} className="premium-btn mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm">
                        {dailyBrief.insights[0].actionLabel || "افتح التفاصيل"} <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {dailyBrief.workSummary && (
              <div className="glass-card p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-400"><Briefcase size={16} className="text-orange-300" /> مهام النهارده</div>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div className="text-4xl font-black text-white">{dailyBrief.todayDoneCount}<span className="text-xl text-slate-500">/{dailyBrief.todayTaskCount + dailyBrief.todayDoneCount}</span></div>
                  {dailyBrief.urgentCount > 0 && <div className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-bold text-red-300">{dailyBrief.urgentCount} متأخرة</div>}
                </div>
                {dailyBrief.todayTaskCount + dailyBrief.todayDoneCount > 0 && (
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full bg-sky-400 transition-all duration-700" style={{ width: `${(dailyBrief.todayDoneCount / (dailyBrief.todayTaskCount + dailyBrief.todayDoneCount)) * 100}%` }} />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.id} mod={mod} index={i} badge={badges[mod.id as keyof typeof badges] ?? null} onClick={handleModuleClick} />
          ))}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent p-4">
        <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2 text-xs text-slate-500 backdrop-blur">
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />متصل</span>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <span>v2.1 Atlas</span>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <span className="flex items-center gap-1"><Shield size={12} />آمن</span>
        </div>
      </div>
    </div>
  );
}
