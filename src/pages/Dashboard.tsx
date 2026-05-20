import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { scoreApi, intelligenceApi } from '../lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Zap,
  Sparkles,
  Calendar as CalendarIcon,
  BookOpen,
  Briefcase,
  Moon,
  Smartphone,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, differenceInDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';
import type { ApiResponse, DailyScore, DashboardIntelligence } from '../types';

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const [intelligence, setIntelligence] = useState<DashboardIntelligence | null>(null);
  const [lifeScore, setLifeScore] = useState<number | null>(null);

  useEffect(() => {
    intelligenceApi.getDashboard().then((r: ApiResponse<DashboardIntelligence>) => { if (r.success) setIntelligence(r.data ?? null); });
    scoreApi.getToday().then((r: ApiResponse<DailyScore>) => { if (r.success) setLifeScore(r.data?.total ?? null); });
  }, []);

  // Calculate real stats
  const todayTasks = state.tasks.filter(t => t.status !== 'completed');
  const completionRate = state.tasks.length > 0 
    ? Math.round((state.tasks.filter(t => t.status === 'completed').length / state.tasks.length) * 100) 
    : 0;
  
  const totalEstimatedMinutes = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const availableHours = (totalEstimatedMinutes / 60).toFixed(1);

  const netBalance = state.transactions.reduce((acc, t) => 
    t.type === 'income' ? acc + t.amount : acc - t.amount, 0
  );

  const latestLog = state.lifestyleLogs[0];

  const nextExam = (state.subjects || []).length > 0 
    ? (state.subjects || [])
        .filter(s => s && s.examDate && new Date(s.examDate) >= new Date())
        .reduce((prev, curr) => {
          if (!prev) return curr;
          try {
            const prevDiff = differenceInDays(new Date(prev.examDate), new Date());
            const currDiff = differenceInDays(new Date(curr.examDate), new Date());
            return currDiff < prevDiff ? curr : prev;
          } catch (e) {
            return prev;
          }
        }, state.subjects[0])
    : null;

  // Dynamic Weekly pressure data
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 }); // Saturday
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(weekStart, i);
    const dayTasks = state.tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
    const totalMinutes = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
    // Normalize to 0-100 for the chart (assuming 8 hours is 100% pressure)
    const pressure = Math.min(Math.round((totalMinutes / 480) * 100), 100);
    
    return {
      name: format(day, 'EEE', { locale: ar }),
      progress: pressure || Math.floor(Math.random() * 20) + 10, // Lower fallback for empty days
      fullDate: day
    };
  });

  const avgPressure = Math.round(chartData.reduce((acc, d) => acc + d.progress, 0) / 7);
  const pressureLevel = avgPressure > 70 ? 'high' : avgPressure > 35 ? 'medium' : 'low';

  const getPressureInfo = () => {
    switch (pressureLevel) {
      case 'high':
        return {
          label: 'ضغط مرتفع جداً',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          suggestion: 'تحذير: جدولك مزدحم جداً. يُنصح بتأجيل المهام غير العاجلة أو تقليل ساعات العمل لتجنب الاحتراق.'
        };
      case 'medium':
        return {
          label: 'ضغط متوسط',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          suggestion: 'جدولك متوازن حالياً. تأكد من أخذ فترات راحة منتظمة للحفاظ على هذا الإيقاع.'
        };
      default:
        return {
          label: 'ضغط منخفض',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          suggestion: 'لديك متسع من الوقت! يمكنك استغلال هذا الهدوء في إنجاز مهام مستقبلية أو التركيز على التعلم الذاتي.'
        };
    }
  };

  const pressureInfo = getPressureInfo();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">أهلاً بك يا {state.profile.name} 👋</h2>
          <p className="text-white/50 mt-1">
            {state.profile.university} | {state.profile.level} | {state.profile.semester}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="px-4 py-2 text-center border-l border-white/10">
            <div className="text-[10px] text-white/40 uppercase font-bold">التاريخ الهجري</div>
            <div className="text-lg font-bold">
              {new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }).format(new Date())}
            </div>
          </div>
          <div className="px-4 py-2 text-center">
            <div className="text-[10px] text-white/40 uppercase font-bold">اليوم</div>
            <div className="text-lg font-bold">{format(new Date(), 'EEEE, d MMMM', { locale: ar })}</div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="نسبة الإنجاز" 
          value={`${completionRate}%`} 
          icon={<Zap className="text-yellow-400" />} 
          trend="بناءً على المهام الحالية"
          color="yellow"
        />
        <StatCard 
          title="ضغط العمل" 
          value={`${availableHours} س`} 
          icon={<Clock className="text-blue-400" />} 
          trend={`مطلوب لـ ${todayTasks.length} مهام`}
          color="blue"
        />
        <StatCard 
          title="صافي الميزانية" 
          value={`${netBalance.toLocaleString()} ج.م`} 
          icon={<TrendingUp className="text-emerald-400" />} 
          trend="إجمالي المعاملات"
          color="emerald"
        />
        <StatCard 
          title="ساعات النوم" 
          value={`${latestLog?.sleepHours || 0} س`} 
          icon={<Moon className="text-indigo-400" />} 
          trend={`استيقاظ: ${latestLog?.wakeUpTime || '--:--'}`}
          color="indigo"
        />
        {lifeScore !== null && (
          <StatCard
            title="Life Score"
            value={`${lifeScore}/100`}
            icon={<Sparkles className="text-purple-400" />}
            trend="إجمالي اليوم"
            color="purple"
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weekly Pressure Chart */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">مؤشر الضغط الأسبوعي</h3>
                  <p className="text-xs text-white/40">تحليل كثافة المهام (دراسة، عمل، فريلانس)</p>
                </div>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-xl border flex items-center gap-2 self-start",
                pressureInfo.bgColor,
                pressureLevel === 'high' ? 'border-red-500/20' : pressureLevel === 'medium' ? 'border-yellow-500/20' : 'border-emerald-500/20'
              )}>
                <div className={cn("w-2 h-2 rounded-full animate-pulse", pressureLevel === 'high' ? 'bg-red-400' : pressureLevel === 'medium' ? 'bg-yellow-400' : 'bg-emerald-400')} />
                <span className={cn("text-xs font-bold", pressureInfo.color)}>{pressureInfo.label}</span>
              </div>
            </div>

            <div className="h-[250px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff30" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    reversed
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#0ea5e9' }}
                    labelStyle={{ color: '#ffffff60', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorProgress)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg mt-0.5", pressureInfo.bgColor, pressureInfo.color)}>
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1">توصية الذكاء الاصطناعي</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {pressureInfo.suggestion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Priorities */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" />
              أهم الأولويات اليوم
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayTasks.slice(0, 4).map(task => (
                <div key={task.id} className="glass-card p-4 flex items-center gap-4 hover:bg-white/[0.05] transition-colors cursor-pointer group">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    task.priority === 'high' ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                  )}>
                    {task.type === 'work' ? <Briefcase size={20} /> : <Zap size={20} />}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <h4 className="font-bold truncate group-hover:text-brand-400 transition-colors">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <p className="text-[10px] text-white/40">
                        {task.dueDate ? `الاستحقاق: ${format(new Date(task.dueDate), 'd MMM', { locale: ar })}` : task.deadline ? `الموعد: ${format(new Date(task.deadline), 'd MMM', { locale: ar })}` : 'بدون موعد'}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 uppercase font-bold">
                        {task.type}
                      </span>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Countdown & Insights */}
        <div className="space-y-8">
          {/* Telegram Coaching Card */}
          <div className="glass-card p-6 bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]">
                <MessageCircle size={20} />
              </div>
              <div>
                <h4 className="font-bold">المدرب الشخصي (Telegram)</h4>
                <p className="text-[10px] text-white/40">مساعدك الذكي في جيبك</p>
              </div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              "يا فتحي، لاحظت أن تركيزك على SET321 منخفض اليوم. هل تحتاج لإعادة جدولة مهام FlightAssist؟"
            </p>
            <button className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
              فتح المحادثة الآن
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Exam War Room Summary */}
          {nextExam && (
            <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/10" style={{ borderRight: `4px solid ${nextExam.color}` }}>
              <div className="flex items-center gap-2 mb-4" style={{ color: nextExam.color }}>
                <CalendarIcon size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">غرفة العمليات (War Room)</span>
              </div>
              <h4 className="text-2xl font-bold mb-1">{nextExam.name}</h4>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black" style={{ color: nextExam.color }}>
                  {differenceInDays(new Date(nextExam.examDate), new Date())}
                </span>
                <span className="text-lg font-bold text-white/60 mb-2">أيام متبقية</span>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">جاهزية المادة</span>
                    <span className="text-white/80">
                      {nextExam.totalLectures > 0 ? Math.round((nextExam.completedLectures / nextExam.totalLectures) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${nextExam.totalLectures > 0 ? (nextExam.completedLectures / nextExam.totalLectures) * 100 : 0}%`, 
                        backgroundColor: nextExam.color 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Brain: FlightAssist */}
          <div className="glass-card p-6 border-l-4 border-sky-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Briefcase size={20} className="text-sky-400" />
                عقل المشروع: FlightAssist
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">المهام المفتوحة</span>
                <span className="font-bold">{state.tasks.filter(t => t.projectId === 'p1' && t.status !== 'completed').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">الحالة العامة</span>
                <span className="text-sky-400 font-bold">نشط</span>
              </div>
              <button className="w-full py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl text-xs font-bold transition-all border border-sky-500/20">
                فتح لوحة التحكم الخاصة بالمشروع
              </button>
            </div>
          </div>

          {/* AI Strategy Quote */}
          <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10 italic text-center relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand-500/10 rounded-full blur-xl" />
            <p className="text-brand-400 text-sm relative z-10">
              "المهندس الناجح لا يبني الأنظمة فحسب، بل يبني الانضباط الذي يديرها. استمر في التحسين المستمر."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  return (
    <div className="glass-card p-5 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/40 font-medium">{title}</span>
        <div className="p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-[10px] font-bold text-white/30">{trend}</div>
    </div>
  );
};

export default Dashboard;
