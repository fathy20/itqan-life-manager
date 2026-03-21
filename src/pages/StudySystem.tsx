import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ChevronRight,
  Target,
  X,
  Trash2
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const COLOR_PRESETS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

const StudySystem: React.FC = () => {
  const { state, addSubject, updateSubject, deleteSubject } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    examDate: format(new Date(), 'yyyy-MM-dd'),
    examTime: '09:00',
    totalLectures: 10,
    completedLectures: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    color: COLOR_PRESETS[0],
    carryover: false
  });

  const calculateDailyGoal = (subject: any) => {
    const examDate = new Date(subject.examDate);
    if (isNaN(examDate.getTime())) return 0;
    
    const daysLeft = differenceInDays(examDate, new Date());
    if (daysLeft <= 0) return 0;
    const remainingLectures = subject.totalLectures - subject.completedLectures;
    return (remainingLectures / daysLeft).toFixed(1);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      examDate: format(new Date(), 'yyyy-MM-dd'),
      examTime: '09:00',
      totalLectures: 10,
      completedLectures: 0,
      difficulty: 'medium',
      color: COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)],
      carryover: false
    });
    setEditingSubject(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (subject: any) => {
    let timeStr = '09:00';
    if (subject.examTime) {
      if (typeof subject.examTime === 'string') {
        timeStr = subject.examTime;
      } else if (subject.examTime.start) {
        timeStr = subject.examTime.start;
      }
    }

    setFormData({
      name: subject.name,
      examDate: subject.examDate,
      examTime: timeStr,
      totalLectures: subject.totalLectures,
      completedLectures: subject.completedLectures,
      difficulty: subject.difficulty,
      color: subject.color,
      carryover: subject.carryover || false
    });
    setEditingSubject(subject);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject(editingSubject.id, formData);
    } else {
      addSubject(formData);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      deleteSubject(id);
      setShowAddModal(false);
    }
  };

  const handleLogStudy = (subject: any) => {
    if (subject.completedLectures < subject.totalLectures) {
      updateSubject(subject.id, {
        ...subject,
        completedLectures: subject.completedLectures + 1
      });
    }
  };

  const upcomingExams = [...(state.subjects || [])].filter(s => s && s.examDate).sort((a, b) => {
    try {
      return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
    } catch (e) {
      return 0;
    }
  });

  const safeFormat = (dateStr: string, formatStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'تاريخ غير صالح';
      return format(date, formatStr, { locale: ar });
    } catch (e) {
      return 'تاريخ غير صالح';
    }
  };

  const getDaysLeft = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 0;
      const diff = differenceInDays(date, new Date());
      return diff > 0 ? diff : 0;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">غرفة عمليات الامتحانات (War Room)</h2>
          <p className="text-white/50 mt-1">تتبع تقدمك في المواد، مواعيد الامتحانات، وخطط المراجعة المكثفة.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="glass-button px-6 py-3 flex items-center gap-2 text-brand-400 font-bold"
        >
          <Plus size={20} />
          إضافة مادة
        </button>
      </header>

      {/* Exam Timeline / War Room Summary */}
      <section className="glass-card p-6 border-brand-500/20 bg-brand-500/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
            <AlertCircle size={20} />
          </div>
          <h3 className="text-xl font-bold">الجدول الزمني للامتحانات</h3>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {upcomingExams.map((subject, idx) => {
            const daysLeft = getDaysLeft(subject.examDate);
            const isNext = idx === 0;
            
            return (
              <div 
                key={subject.id} 
                className={cn(
                  "min-w-[200px] p-4 rounded-2xl border transition-all",
                  isNext ? "bg-brand-500/10 border-brand-500 shadow-[0_0_20px_rgba(var(--brand-rgb),0.1)]" : "bg-white/5 border-white/10"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase">
                    {isNext ? 'الامتحان القادم' : `امتحان ${idx + 1}`}
                  </span>
                  {subject.carryover && (
                    <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">CARRYOVER</span>
                  )}
                </div>
                <h4 className="font-bold truncate mb-1">{subject.name}</h4>
                <div className="flex items-center gap-1 text-xs text-white/60 mb-3">
                  <Calendar size={12} />
                  {safeFormat(subject.examDate, 'd MMM')}
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-black text-brand-400">{daysLeft} <span className="text-[10px] font-normal text-white/40">يوم</span></div>
                  <div className="text-[10px] font-bold text-white/40">
                    {subject.totalLectures > 0 ? Math.round((subject.completedLectures / subject.totalLectures) * 100) : 0}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(state.subjects || []).map(subject => {
          const progress = (subject.completedLectures / subject.totalLectures) * 100;
          const daysLeft = getDaysLeft(subject.examDate);
          const dailyGoal = calculateDailyGoal(subject);
          
          return (
            <div key={subject.id} className="glass-card overflow-hidden group relative">
              {subject.carryover && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded shadow-lg transform -rotate-12">CARRYOVER</div>
                </div>
              )}
              <div className="h-2 w-full" style={{ backgroundColor: subject.color }} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-brand-400 transition-colors">{subject.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-white/40 text-xs mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {safeFormat(subject.examDate, 'd MMMM')}
                      </div>
                      {subject.examTime && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {typeof subject.examTime === 'string' 
                            ? subject.examTime 
                            : `${subject.examTime.start} - ${subject.examTime.end}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    subject.difficulty === 'hard' ? "bg-red-500/10 text-red-400" :
                    subject.difficulty === 'medium' ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-emerald-500/10 text-emerald-400"
                  )}>
                    {subject.difficulty === 'hard' ? 'صعب' : subject.difficulty === 'medium' ? 'متوسط' : 'سهل'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-black text-white">{daysLeft}</div>
                      <div className="text-[10px] text-white/40 uppercase font-bold">يوم متبقي</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-brand-400">{dailyGoal}</div>
                      <div className="text-[10px] text-white/40 uppercase font-bold">محاضرة/يوم</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">التقدم: {subject.completedLectures}/{subject.totalLectures} محاضرة</span>
                      <span className="font-bold">{subject.totalLectures > 0 ? Math.round(progress) : 0}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${subject.totalLectures > 0 ? progress : 0}%`, backgroundColor: subject.color }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(subject)}
                    className="flex-1 glass-button py-2 text-xs font-bold"
                  >
                    تعديل
                  </button>
                  <button 
                    onClick={() => handleLogStudy(subject)}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    سجل مذاكرة
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Target className="text-brand-400" size={20} />
            خطة المذاكرة المقترحة لليوم
          </h3>
          <div className="space-y-4">
            {(state.subjects || []).slice(0, 3).map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                  0{i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{s.name}</div>
                  <div className="text-[10px] text-white/40">مطلوب إنجاز {calculateDailyGoal(s)} محاضرة</div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-white/20" />
                  <span className="text-xs text-white/60">60 دقيقة</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 border-red-500/20 bg-red-500/5">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-red-400">
            <AlertCircle size={20} />
            مواد في منطقة الخطر
          </h3>
          <div className="space-y-4">
            {(state.subjects || []).filter(s => s && s.difficulty === 'hard' && s.totalLectures > 0 && (s.completedLectures / s.totalLectures) < 0.5).map(s => (
              <div key={s.id} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{s.name}</span>
                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded">متأخر جداً</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  تحتاج لزيادة معدل المذاكرة اليومي إلى {calculateDailyGoal(s)} محاضرة لتتمكن من ختم المادة قبل الامتحان بـ 3 أيام للمراجعة.
                </p>
              </div>
            ))}
            {(state.subjects || []).filter(s => s && s.carryover && s.totalLectures > 0 && (s.completedLectures / s.totalLectures) < 0.3).map(s => (
              <div key={s.id} className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{s.name} (Carryover)</span>
                  <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded">أولوية خاصة</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  هذه المادة من الترم السابق، لا تسمح بتراكمها أكثر من ذلك.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">{editingSubject ? 'تعديل مادة' : 'إضافة مادة جديدة'}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">اسم المادة</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors"
                    placeholder="مثال: هندسة البرمجيات"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">تاريخ الامتحان</label>
                    <input 
                      type="date"
                      required
                      value={formData.examDate}
                      onChange={e => setFormData({ ...formData, examDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">وقت الامتحان</label>
                    <input 
                      type="time"
                      value={formData.examTime}
                      onChange={e => setFormData({ ...formData, examTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">الصعوبة</label>
                    <select 
                      value={formData.difficulty}
                      onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors"
                    >
                      <option value="easy">سهل</option>
                      <option value="medium">متوسط</option>
                      <option value="hard">صعب</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <input 
                      type="checkbox"
                      id="carryover"
                      checked={formData.carryover}
                      onChange={e => setFormData({ ...formData, carryover: e.target.checked })}
                      className="w-5 h-5 rounded bg-white/5 border-white/10 text-brand-500 focus:ring-brand-500"
                    />
                    <label htmlFor="carryover" className="text-sm font-bold text-white/60 cursor-pointer">مادة Carryover</label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">إجمالي المحاضرات</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      value={formData.totalLectures}
                      onChange={e => setFormData({ ...formData, totalLectures: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">المحاضرات المنجزة</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      max={formData.totalLectures}
                      value={formData.completedLectures}
                      onChange={e => setFormData({ ...formData, completedLectures: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">لون المادة</label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_PRESETS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          formData.color === color ? "border-white scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  {editingSubject && (
                    <button 
                      type="button"
                      onClick={() => handleDelete(editingSubject.id)}
                      className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    {editingSubject ? 'حفظ التعديلات' : 'إضافة المادة'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudySystem;
