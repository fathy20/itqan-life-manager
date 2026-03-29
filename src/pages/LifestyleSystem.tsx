import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Smartphone, Droplets, Footprints, Zap, CheckCircle2, Circle, TrendingUp, Award, Plus, X, Trash2, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const LifestyleSystem: React.FC = () => {
  const { state, updateHabit, addHabit, deleteHabit, addLifestyleLog } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [habitForm, setHabitForm] = useState({ name: '', icon: '⭐', category: 'personal' as 'spiritual'|'health'|'study'|'work'|'personal', frequency: 'daily' as 'daily'|'weekly' });
  const [logForm, setLogForm] = useState({ sleepHours: 7, wakeUpTime: '07:00', phoneUsageMinutes: 120, phonePickups: 30, waterIntake: 8, steps: 5000 });

  const latestLog = state.lifestyleLogs[0] || { date: today, sleepHours: 0, wakeUpTime: '00:00', phoneUsageMinutes: 0, phonePickups: 0, waterIntake: 0, steps: 0 };
  const sleepData = state.lifestyleLogs.slice(0, 7).reverse().map(log => ({ day: format(new Date(log.date), 'EEE', { locale: ar }), hours: log.sleepHours }));
  const habitCompletionRate = state.habits.length > 0 ? Math.round((state.habits.filter(h => h.completedDates.includes(today)).length / state.habits.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">أسلوب الحياة والعادات</h2>
          <p className="text-white/50 mt-1">راقب صحتك البدنية والنفسية والتزم بعاداتك اليومية.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold">الحالة: متوازن</span>
          </div>
          <button onClick={() => setShowLogModal(true)} className="glass-button px-4 py-2 text-xs font-bold text-brand-400 flex items-center gap-2">
            <Plus size={14} /> تسجيل اليوم
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="text-yellow-400" size={24} /> العادات اليومية
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 font-bold">إنجاز اليوم: {habitCompletionRate}%</span>
              <button onClick={() => setShowAddHabit(true)} className="glass-button p-2 text-brand-400">
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.habits.map(habit => {
              const isCompleted = habit.completedDates.includes(today);
              return (
                <button key={habit.id} onClick={() => updateHabit(habit.id, today)}
                  className={cn('glass-card p-5 flex items-center justify-between group transition-all active:scale-[0.98] relative overflow-hidden',
                    isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 'hover:bg-white/5')}>
                  {isCompleted && <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />}
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 group-hover:text-white')}>
                      {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div className="text-right">
                      <h4 className={cn('font-bold', isCompleted && 'text-emerald-400')}>{habit.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-white/30 font-bold">
                        <TrendingUp size={10} /> سلسلة: {habit.streak} أيام
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-bold text-white/20 uppercase">{habit.category}</div>
                    <button onClick={e => { e.stopPropagation(); deleteHabit(habit.id); }}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Award className="text-brand-400" size={24} /> الجانب الروحاني
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['الفجر','الظهر','العصر','المغرب','العشاء','الورد','القيام','الأذكار'].map(name => (
                <button key={name} className="glass-card p-4 text-center hover:bg-brand-500/10 hover:border-brand-500/20 transition-all group">
                  <div className="text-sm font-bold mb-2 group-hover:text-brand-400">{name}</div>
                  <div className="w-2 h-2 rounded-full bg-white/10 mx-auto group-hover:bg-brand-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Moon className="text-indigo-400" size={20} /> ساعات النوم
              </h3>
              <span className="text-xs font-bold text-white/40">المعدل: {latestLog.sleepHours} س</span>
            </div>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="hours" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-white/40">
              <span>الاستيقاظ: <span className="text-white font-bold">{latestLog.wakeUpTime}</span></span>
              <span>الهدف: 7.5 س</span>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Smartphone className="text-red-400" size={20} /> استخدام الهاتف
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/60">الوقت الإجمالي</div>
                <div className="text-xl font-bold">{Math.floor(latestLog.phoneUsageMinutes / 60)}س {latestLog.phoneUsageMinutes % 60}د</div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={cn('h-full transition-all', latestLog.phoneUsageMinutes > 240 ? 'bg-red-500' : 'bg-brand-500')}
                  style={{ width: `${Math.min((latestLog.phoneUsageMinutes / 300) * 100, 100)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <div className="text-lg font-bold">{latestLog.phonePickups}</div>
                  <div className="text-[10px] text-white/40 font-bold">مرات المسك</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <div className={cn('text-lg font-bold', latestLog.phonePickups > 50 ? 'text-red-400' : 'text-emerald-400')}>
                    {latestLog.phonePickups > 50 ? '+12%' : '-5%'}
                  </div>
                  <div className="text-[10px] text-white/40 font-bold">عن المعتاد</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 flex flex-col items-center gap-2 group hover:bg-blue-500/5 transition-all">
              <Droplets className="text-blue-400" size={24} />
              <div className="text-lg font-bold">{latestLog.waterIntake}/10</div>
              <div className="text-[10px] text-white/40 font-bold">أكواب ماء</div>
            </div>
            <div className="glass-card p-4 flex flex-col items-center gap-2 group hover:bg-emerald-500/5 transition-all">
              <Footprints className="text-emerald-400" size={24} />
              <div className="text-lg font-bold">{latestLog.steps.toLocaleString()}</div>
              <div className="text-[10px] text-white/40 font-bold">خطوة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddHabit(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">إضافة عادة جديدة</h3>
                <button onClick={() => setShowAddHabit(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input value={habitForm.icon} onChange={e => setHabitForm({...habitForm, icon: e.target.value})}
                    className="w-14 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-center text-xl outline-none" />
                  <input autoFocus value={habitForm.name} onChange={e => setHabitForm({...habitForm, name: e.target.value})}
                    placeholder="اسم العادة"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50" />
                </div>
                <select value={habitForm.category} onChange={e => setHabitForm({...habitForm, category: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none">
                  <option value="spiritual">روحاني</option>
                  <option value="health">صحة</option>
                  <option value="study">دراسة</option>
                  <option value="work">عمل</option>
                  <option value="personal">شخصي</option>
                </select>
                <button onClick={() => { if (!habitForm.name.trim()) return; addHabit(habitForm); setShowAddHabit(false); setHabitForm({name:'',icon:'⭐',category:'personal',frequency:'daily'}); }}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all">
                  إضافة العادة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Today Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">تسجيل يومك</h3>
                <button onClick={() => setShowLogModal(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {([
                    { label: 'ساعات النوم', key: 'sleepHours', type: 'number' },
                    { label: 'وقت الاستيقاظ', key: 'wakeUpTime', type: 'time' },
                    { label: 'استخدام الهاتف (دقيقة)', key: 'phoneUsageMinutes', type: 'number' },
                    { label: 'مرات مسك الهاتف', key: 'phonePickups', type: 'number' },
                    { label: 'أكواب ماء', key: 'waterIntake', type: 'number' },
                    { label: 'خطوات', key: 'steps', type: 'number' },
                  ] as {label:string;key:keyof typeof logForm;type:string}[]).map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase">{f.label}</label>
                      <input type={f.type} value={logForm[f.key]}
                        onChange={e => setLogForm({...logForm, [f.key]: f.type === 'number' ? +e.target.value : e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-brand-500/50 text-sm" />
                    </div>
                  ))}
                </div>
                <button onClick={() => { addLifestyleLog({...logForm, date: today}); setShowLogModal(false); }}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all">
                  حفظ اليوم
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LifestyleSystem;
