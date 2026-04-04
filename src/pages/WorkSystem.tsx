import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWork } from '../hooks/useWork';
import {
  Briefcase,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Zap,
  Calendar,
  Target,
  Timer,
  X,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

const WorkSystem: React.FC = () => {
  const { state, addTask, setState } = useApp();
  const { toggleTask, deleteTask: removeTask } = useWork();
  const [filter, setFilter] = useState<'all' | 'work' | 'freelance' | 'study'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'work' as 'work' | 'freelance' | 'study' | 'personal',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: format(new Date(), 'yyyy-MM-dd'),
    estimatedMinutes: 60,
    focusType: 'medium' as 'deep' | 'medium' | 'light',
  });

  const filteredTasks = state.tasks.filter(t => filter === 'all' || t.type === filter);

  const handleToggleTask = (taskId: string) => {
    toggleTask(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    removeTask(taskId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask({ ...form, status: 'todo' });
    setShowAddModal(false);
    setForm({ title: '', type: 'work', priority: 'medium', deadline: format(new Date(), 'yyyy-MM-dd'), estimatedMinutes: 60, focusType: 'medium' });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">إدارة العمل والمشاريع</h2>
          <p className="text-white/50 mt-1">تتبع مهامك الوظيفية، مشاريع الفريلانس، ومسارك المهني.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex overflow-x-auto">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'work', label: 'وظيفة' },
              { id: 'freelance', label: 'فريلانس' },
              { id: 'study', label: 'تعلم' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as any)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  filter === item.id ? "bg-brand-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="glass-button p-3 text-brand-400 hover:text-brand-300"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Career Track */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Target className="text-brand-400" />
          المسار المهني (Career Track)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.courses.map(course => (
            <div key={course.id} className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-500/10 transition-all" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-lg">{course.name}</h4>
                  <p className="text-xs text-white/40">{course.platform}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5" style={{ color: course.color }}>
                  <Zap size={18} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">التقدم الكلي</span>
                    <span className="font-bold">
                      {course.totalHours > 0 ? Math.round((course.completedHours / course.totalHours) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-500" style={{ width: `${course.totalHours > 0 ? (course.completedHours / course.totalHours) * 100 : 0}%`, backgroundColor: course.color }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">الهدف الأسبوعي: <span className="text-white font-bold">{course.weeklyGoalHours} س</span></span>
                  <span className="text-white/40">المنجز: <span className="text-white font-bold">{course.completedHours} س</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="text-sky-400" />
          المشاريع النشطة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {state.projects.map(project => (
            <div key={project.id} className="glass-card p-6 border-l-4" style={{ borderLeftColor: project.color }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{project.name}</h3>
                  <p className="text-xs text-white/40">{project.client || 'مشروع داخلي'}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <Briefcase size={18} className="text-white/40" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">الحالة</span>
                  <span className="font-bold text-emerald-400">{project.status === 'ongoing' ? 'نشط' : project.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">الأولوية</span>
                  <span className={cn("font-bold", project.priority === 'high' ? "text-red-400" : "text-blue-400")}>
                    {project.priority === 'high' ? 'عالية' : project.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            className="glass-card p-6 border-dashed border-2 border-white/10 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white/60 transition-all"
          >
            <Plus size={24} />
            <span className="text-sm font-bold">إضافة مهمة جديدة</span>
          </button>
        </div>
      </section>

      {/* Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">قائمة المهام ({filteredTasks.length})</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-brand-400 text-xs font-bold flex items-center gap-1 hover:text-brand-300"
          >
            <Plus size={14} />
            إضافة مهمة
          </button>
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 && (
            <div className="glass-card p-12 text-center text-white/20">
              <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد مهام في هذه الفئة</p>
            </div>
          )}
          {filteredTasks.map(task => (
            <div key={task.id} className="glass-card p-4 flex items-center gap-4 group hover:bg-white/[0.04] transition-all">
              <button
                onClick={() => handleToggleTask(task.id)}
                className="text-white/20 hover:text-brand-400 transition-colors shrink-0"
              >
                {task.status === 'completed'
                  ? <CheckCircle2 size={24} className="text-emerald-500" />
                  : <Circle size={24} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={cn("font-bold truncate", task.status === 'completed' && "text-white/20 line-through")}>
                    {task.title}
                  </h4>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0",
                    task.type === 'work' ? "bg-blue-500/10 text-blue-400" :
                    task.type === 'freelance' ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-purple-500/10 text-purple-400"
                  )}>
                    {task.type === 'work' ? 'وظيفة' : task.type === 'freelance' ? 'فريلانس' : 'تعلم'}
                  </span>
                  {task.priority === 'high' && (
                    <span className="text-[10px] text-red-400 font-bold flex items-center gap-0.5 shrink-0">
                      <AlertCircle size={10} /> أولوية قصوى
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {task.deadline && (
                    <div className="flex items-center gap-1 text-[10px] text-white/30">
                      <Calendar size={10} />
                      {format(new Date(task.deadline), 'd MMM', { locale: ar })}
                    </div>
                  )}
                  {task.estimatedMinutes && (
                    <div className="flex items-center gap-1 text-[10px] text-white/30">
                      <Timer size={10} />
                      {task.estimatedMinutes} د
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-2 hover:bg-red-500/10 rounded-lg text-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">إضافة مهمة جديدة</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">عنوان المهمة</label>
                  <input
                    autoFocus required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="مثال: مراجعة API integration"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">النوع</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50"
                    >
                      <option value="work">وظيفة</option>
                      <option value="freelance">فريلانس</option>
                      <option value="study">دراسة</option>
                      <option value="personal">شخصي</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">الأولوية</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm({ ...form, priority: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50"
                    >
                      <option value="high">عالية</option>
                      <option value="medium">متوسطة</option>
                      <option value="low">منخفضة</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">الموعد النهائي</label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={e => setForm({ ...form, deadline: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">الوقت المقدر (دقيقة)</label>
                    <input
                      type="number" min="15" step="15"
                      value={form.estimatedMinutes}
                      onChange={e => setForm({ ...form, estimatedMinutes: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">نوع التركيز</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'deep', label: 'عميق 🧠' },
                      { id: 'medium', label: 'متوسط ⚡' },
                      { id: 'light', label: 'خفيف 🌿' },
                    ].map(f => (
                      <button
                        key={f.id} type="button"
                        onClick={() => setForm({ ...form, focusType: f.id as any })}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                          form.focusType === f.id
                            ? "bg-brand-500/20 border-brand-500/50 text-brand-400"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all mt-2"
                >
                  إضافة المهمة
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkSystem;
