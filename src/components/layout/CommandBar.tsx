import React, { useState, useEffect } from 'react';
import { Search, Plus, Command, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

const CommandBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'add-task' | 'add-expense'>('menu');
  const { addTask, addTransaction } = useApp();

  // Form state for new task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDeadline, setTaskDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [taskType, setTaskType] = useState<'work' | 'freelance' | 'personal'>('work');

  // Form state for expense
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('طعام');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseType, setExpenseType] = useState<'expense' | 'income'>('expense');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setView('menu');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle,
      notes: taskNotes,
      dueDate: taskDueDate,
      deadline: taskDeadline,
      type: taskType,
      priority: 'medium',
      status: 'todo'
    });
    setTaskTitle('');
    setTaskNotes('');
    setIsOpen(false);
    setView('menu');
  };

  const handleAddExpense = () => {
    if (!expenseAmount || isNaN(Number(expenseAmount))) return;
    addTransaction({
      type: expenseType,
      amount: Number(expenseAmount),
      category: expenseCategory,
      note: expenseNote,
      date: new Date().toISOString().split('T')[0],
    });
    setExpenseAmount('');
    setExpenseNote('');
    setIsOpen(false);
    setView('menu');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={() => {
          setIsOpen(true);
          setView('menu');
        }}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-72 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg shadow-brand-500/20 flex items-center justify-center z-50 transition-transform active:scale-95"
      >
        <Plus size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
            >
              {view === 'menu' ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <Search className="text-white/40" size={20} />
                    <input 
                      autoFocus
                      placeholder="ماذا تريد أن تفعل؟ (أضف مهمة، مادة، مصروف...)"
                      className="bg-transparent border-none outline-none flex-1 text-lg placeholder:text-white/20"
                    />
                    <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-white/40">
                      <Command size={10} />
                      <span>K</span>
                    </div>
                  </div>
                  
                  <div className="p-2 max-h-[60vh] overflow-y-auto">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 font-bold">إجراءات سريعة</div>
                    <div className="space-y-1">
                      {[
                        { label: 'إضافة مهمة جديدة', shortcut: 'T', action: () => setView('add-task') },
                        { label: 'تسجيل مصروف', shortcut: 'E', action: () => setView('add-expense') },
                        { label: 'بدأ جلسة تركيز', shortcut: 'F' },
                        { label: 'إضافة مادة دراسية', shortcut: 'S' },
                        { label: 'تسجيل ساعات النوم', shortcut: 'L' },
                      ].map((item) => (
                        <button 
                          key={item.label}
                          onClick={item.action}
                          className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-xl transition-colors text-right"
                        >
                          <span className="text-white/80">{item.label}</span>
                          <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded uppercase">{item.shortcut}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : view === 'add-expense' ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">تسجيل معاملة مالية</h3>
                    <button onClick={() => setView('menu')} className="text-white/40 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setExpenseType('expense')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${expenseType === 'expense' ? 'bg-red-500/20 text-red-400' : 'text-white/40'}`}
                    >مصروف</button>
                    <button
                      type="button"
                      onClick={() => setExpenseType('income')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${expenseType === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40'}`}
                    >دخل</button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase mb-2">المبلغ (ج.م)</label>
                    <input
                      autoFocus type="number" min="1"
                      value={expenseAmount}
                      onChange={e => setExpenseAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold outline-none focus:border-brand-500/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase mb-2">الفئة</label>
                      <select
                        value={expenseCategory}
                        onChange={e => setExpenseCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50"
                      >
                        {(expenseType === 'expense'
                          ? ['طعام', 'مواصلات', 'فواتير', 'ترفيه', 'ملابس', 'صحة', 'تعليم', 'أخرى']
                          : ['مرتب', 'فريلانس', 'هدية', 'أخرى']
                        ).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase mb-2">ملاحظة</label>
                      <input
                        value={expenseNote}
                        onChange={e => setExpenseNote(e.target.value)}
                        placeholder="اختياري"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddExpense}
                    className={`w-full font-bold py-4 rounded-xl transition-all mt-2 ${expenseType === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
                  >
                    {expenseType === 'expense' ? 'تسجيل المصروف' : 'تسجيل الدخل'}
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">إضافة مهمة جديدة</h3>
                    <button onClick={() => setView('menu')} className="text-white/40 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase mb-2">عنوان المهمة</label>
                      <input 
                        autoFocus
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="مثلاً: مراجعة التقرير المالي"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase mb-2">ملاحظات إضافية</label>
                      <textarea 
                        value={taskNotes}
                        onChange={(e) => setTaskNotes(e.target.value)}
                        placeholder="أضف أي تفاصيل أو ملاحظات هنا..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase mb-2">تاريخ الاستحقاق (Due Date)</label>
                        <input 
                          type="date"
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase mb-2">الموعد النهائي (Deadline)</label>
                        <input 
                          type="date"
                          value={taskDeadline}
                          onChange={(e) => setTaskDeadline(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-white/40 uppercase mb-2">نوع المهمة</label>
                        <select 
                          value={taskType}
                          onChange={(e) => setTaskType(e.target.value as any)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-all"
                        >
                          <option value="work">وظيفة</option>
                          <option value="freelance">فريلانس</option>
                          <option value="personal">شخصي</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={handleAddTask}
                      className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] mt-4"
                    >
                      إضافة المهمة
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommandBar;
