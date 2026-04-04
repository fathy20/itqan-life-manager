import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useStudy } from '../hooks/useStudy';
import { useSalah } from '../hooks/useSalah';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  BookOpen,
  Briefcase,
  Zap,
  Heart,
  X
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  isToday as dateFnsIsToday
} from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type CalEvent = {
  type: 'exam' | 'task-deadline' | 'task-due' | 'habit';
  title: string;
  color: string;
  time?: string;
  subtype?: string;
};

const TYPE_COLORS: Record<string, string> = {
  work: '#3b82f6',
  freelance: '#10b981',
  study: '#8b5cf6',
  personal: '#f59e0b',
};

const CalendarView: React.FC = () => {
  const { state } = useApp();
  const { nextExam } = useStudy();
  const { prayerLog, times } = useSalah();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getEventsForDay = (day: Date): CalEvent[] => {
    const events: CalEvent[] = [];
    const dateStr = format(day, 'yyyy-MM-dd');

    // Exams
    (state.subjects || []).forEach(s => {
      if (s?.examDate === dateStr) {
        events.push({
          type: 'exam',
          title: s.name.replace(/^SET\d+\s|^HUM\d+\s/, ''),
          color: s.color,
          time: s.examTime ? (typeof s.examTime === 'string' ? s.examTime : s.examTime.start) : undefined,
          subtype: 'امتحان'
        });
      }
    });

    // Tasks deadlines
    (state.tasks || []).forEach(t => {
      if (t?.deadline === dateStr) {
        events.push({
          type: 'task-deadline',
          title: t.title,
          color: TYPE_COLORS[t.type] || '#f59e0b',
          subtype: 'موعد نهائي'
        });
      }
      if (t?.dueDate === dateStr && t.dueDate !== t.deadline) {
        events.push({
          type: 'task-due',
          title: t.title,
          color: '#f59e0b',
          subtype: 'استحقاق'
        });
      }
    });

    return events;
  };

  const selectedEvents = getEventsForDay(selectedDate);

  // Week starts on Saturday (6) for Arabic calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 6 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 6 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const dayNames = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return <BookOpen size={12} />;
      case 'task-deadline':
      case 'task-due': return <Briefcase size={12} />;
      default: return <Zap size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{format(currentMonth, 'MMMM yyyy', { locale: ar })}</h2>
          <p className="text-white/50 mt-1">جدولك الزمني المتكامل لكل الأنشطة.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}
              className="px-4 py-2 text-xs font-bold hover:bg-white/10 rounded-lg transition-colors"
            >
              اليوم
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white p-3 rounded-xl transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-white/30 tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-px bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden">
            {calendarDays.map((day, i) => {
              const events = getEventsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = dateFnsIsToday(day);

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] p-2 transition-all cursor-pointer relative",
                    isCurrentMonth ? "bg-[#0a0a0a] hover:bg-white/[0.03]" : "bg-[#050505]",
                    !isCurrentMonth && "opacity-25",
                    isSelected && "bg-brand-500/[0.07] ring-1 ring-inset ring-brand-500/30"
                  )}
                >
                  <div className="mb-1.5">
                    <span className={cn(
                      "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
                      isToday ? "bg-brand-500 text-white" : "text-white/60"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {events.slice(0, 3).map((event, idx) => (
                      <div
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1"
                        style={{ backgroundColor: `${event.color}18`, color: event.color, border: `1px solid ${event.color}25` }}
                      >
                        <span className="shrink-0">{getEventIcon(event.type)}</span>
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="text-[8px] text-white/30 font-bold px-1">+{events.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 px-1">
            {[
              { color: '#ef4444', label: 'امتحان' },
              { color: '#3b82f6', label: 'مهمة وظيفة' },
              { color: '#10b981', label: 'فريلانس' },
              { color: '#8b5cf6', label: 'دراسة' },
              { color: '#f59e0b', label: 'استحقاق' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-white/40">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Selected Day Agenda */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
              <Clock size={16} className="text-brand-400" />
              أجندة اليوم
            </h3>
            <div className="text-xs text-white/40 mb-4 font-bold">
              {format(selectedDate, 'EEEE، d MMMM yyyy', { locale: ar })}
            </div>

            {selectedEvents.length === 0 ? (
              <div className="text-center py-8 text-white/20">
                <CalendarIcon size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">لا توجد أحداث في هذا اليوم</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl border"
                    style={{ backgroundColor: `${event.color}10`, borderColor: `${event.color}25` }}
                  >
                    <div className="mt-0.5" style={{ color: event.color }}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase mb-0.5" style={{ color: event.color }}>
                        {event.subtype}
                        {event.time && ` · ${event.time}`}
                      </div>
                      <div className="text-xs font-bold text-white/80 leading-tight">{event.title}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming exams quick view */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-red-400" />
              الامتحانات القادمة
            </h3>
            <div className="space-y-2">
              {(state.subjects || [])
                .filter(s => new Date(s.examDate) >= new Date())
                .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
                .slice(0, 4)
                .map(s => {
                  const daysLeft = Math.ceil((new Date(s.examDate).getTime() - new Date().getTime()) / 86400000);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedDate(new Date(s.examDate));
                        setCurrentMonth(new Date(s.examDate));
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-right"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-xs text-white/70 truncate max-w-[120px]">
                          {s.name.replace(/^SET\d+\s|^HUM\d+\s/, '')}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        daysLeft <= 3 ? "bg-red-500/20 text-red-400" :
                        daysLeft <= 7 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-white/5 text-white/40"
                      )}>
                        {daysLeft}د
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-black text-brand-400">
                {(state.tasks || []).filter(t => t.status !== 'completed').length}
              </div>
              <div className="text-[10px] text-white/40 font-bold mt-1">مهام مفتوحة</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-black text-red-400">
                {(state.subjects || []).filter(s => new Date(s.examDate) >= new Date()).length}
              </div>
              <div className="text-[10px] text-white/40 font-bold mt-1">امتحانات قادمة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal (placeholder) */}
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
              className="relative glass-card p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">إضافة حدث جديد</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <p className="text-white/40 text-sm text-center py-8">
                لإضافة مهام أو مواد، استخدم صفحة العمل أو الدراسة مباشرة وستظهر هنا تلقائياً.
              </p>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                حسناً
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;
