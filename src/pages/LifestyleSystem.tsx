import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  Moon, 
  Smartphone, 
  Droplets, 
  Footprints, 
  Zap,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';

const LifestyleSystem: React.FC = () => {
  const { state, updateHabit } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const latestLog = state.lifestyleLogs[0] || {
    date: today,
    sleepHours: 0,
    wakeUpTime: '00:00',
    phoneUsageMinutes: 0,
    phonePickups: 0,
    waterGlasses: 0,
    steps: 0,
    mood: 'neutral'
  };

  const sleepData = state.lifestyleLogs.slice(0, 7).reverse().map(log => ({
    day: format(new Date(log.date), 'EEE', { locale: ar }),
    hours: log.sleepHours
  }));

  const habitCompletionRate = state.habits.length > 0 ? Math.round(
    (state.habits.filter(h => h.completedDates.includes(today)).length / state.habits.length) * 100
  ) : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">أسلوب الحياة والعادات (Lifestyle Hub)</h2>
          <p className="text-white/50 mt-1">راقب صحتك البدنية والنفسية والتزم بعاداتك اليومية لتحقيق التوازن.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold">الحالة: متوازن</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Habits Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="text-yellow-400" size={24} />
              العادات اليومية
            </h3>
            <span className="text-xs text-white/40 font-bold uppercase">إنجاز اليوم: {habitCompletionRate}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.habits.map(habit => {
              const isCompleted = habit.completedDates.includes(today);
              return (
                <button 
                  key={habit.id}
                  onClick={() => updateHabit(habit.id, today)}
                  className={cn(
                    "glass-card p-5 flex items-center justify-between group transition-all active:scale-[0.98] relative overflow-hidden",
                    isCompleted ? "bg-emerald-500/10 border-emerald-500/20" : "hover:bg-white/5"
                  )}
                >
                  {isCompleted && (
                    <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
                  )}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                      isCompleted ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 text-white/40 group-hover:text-white"
                    )}>
                      {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div className="text-right">
                      <h4 className={cn("font-bold transition-colors", isCompleted && "text-emerald-400")}>{habit.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-white/30 font-bold">
                        <TrendingUp size={10} />
                        سلسلة: {habit.streak} أيام
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-white/20 uppercase">{habit.category || 'عام'}</div>
                    <div className="text-xs font-bold text-white/60">يومي</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Spiritual Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Award className="text-brand-400" size={24} />
              الجانب الروحاني (Spiritual Track)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'الفجر', time: '04:45' },
                { name: 'الظهر', time: '12:05' },
                { name: 'العصر', time: '15:30' },
                { name: 'المغرب', time: '18:10' },
                { name: 'العشاء', time: '19:30' },
                { name: 'الورد', time: 'مرن' },
                { name: 'القيام', time: 'ليل' },
                { name: 'الأذكار', time: 'ص/م' }
              ].map(item => (
                <button key={item.name} className="glass-card p-4 text-center hover:bg-brand-500/10 hover:border-brand-500/20 transition-all group relative">
                  <div className="text-sm font-bold mb-1 group-hover:text-brand-400">{item.name}</div>
                  <div className="text-[10px] text-white/20 mb-2">{item.time}</div>
                  <div className="w-2 h-2 rounded-full bg-white/10 mx-auto group-hover:bg-brand-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Health & Usage Section */}
        <div className="space-y-8">
          {/* Sleep Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Moon className="text-indigo-400" size={20} />
                ساعات النوم
              </h3>
              <span className="text-xs font-bold text-white/40">المعدل: {latestLog.sleepHours} س</span>
            </div>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#818cf8" 
                    strokeWidth={3} 
                    dot={{ fill: '#818cf8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-white/40">
              <span>الاستيقاظ: <span className="text-white font-bold">{latestLog.wakeUpTime}</span></span>
              <span>الهدف: 7.5 س</span>
            </div>
          </div>

          {/* Phone Usage */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Smartphone className="text-red-400" size={20} />
              استخدام الهاتف
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/60">الوقت الإجمالي</div>
                <div className="text-xl font-bold">{Math.floor(latestLog.phoneUsageMinutes / 60)}س {latestLog.phoneUsageMinutes % 60}د</div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    latestLog.phoneUsageMinutes > 240 ? "bg-red-500" : "bg-brand-500"
                  )} 
                  style={{ width: `${Math.min((latestLog.phoneUsageMinutes / 300) * 100, 100)}%` }} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-lg font-bold">{latestLog.phonePickups}</div>
                  <div className="text-[10px] text-white/40 uppercase font-bold">مرات المسك</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className={cn(
                    "text-lg font-bold",
                    latestLog.phonePickups > 50 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {latestLog.phonePickups > 50 ? '+12%' : '-5%'}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase font-bold">عن المعتاد</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 flex flex-col items-center gap-2 group hover:bg-blue-500/5 transition-all">
              <Droplets className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
              <div className="text-lg font-bold">{latestLog.waterIntake}/10</div>
              <div className="text-[10px] text-white/40 uppercase font-bold">أكواب ماء</div>
            </div>
            <div className="glass-card p-4 flex flex-col items-center gap-2 group hover:bg-emerald-500/5 transition-all">
              <Footprints className="text-emerald-400 group-hover:scale-110 transition-transform" size={24} />
              <div className="text-lg font-bold">{latestLog.steps.toLocaleString()}</div>
              <div className="text-[10px] text-white/40 uppercase font-bold">خطوة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifestyleSystem;
