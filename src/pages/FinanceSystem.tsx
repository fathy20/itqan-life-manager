import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Search,
  PieChart as PieChartIcon,
  ShoppingBag,
  Calendar,
  CreditCard,
  Target,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { format, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

const EXPENSE_CATEGORIES = ['طعام', 'مواصلات', 'فواتير', 'ترفيه', 'ملابس', 'صحة', 'تعليم', 'أخرى'];
const INCOME_CATEGORIES = ['مرتب', 'فريلانس', 'هدية', 'أخرى'];

const FinanceSystem: React.FC = () => {
  const { state, setMonthlySalary, addTransaction } = useApp();
  const [salaryInput, setSalaryInput] = useState((state.monthlySalary ?? 15000).toString());
  const [showAddModal, setShowAddModal] = useState(false);
  const [txForm, setTxForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'طعام',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [showSalaryEdit, setShowSalaryEdit] = useState(false);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.amount || isNaN(Number(txForm.amount))) return;
    addTransaction({
      type: txForm.type,
      amount: Number(txForm.amount),
      category: txForm.category,
      note: txForm.note,
      date: txForm.date,
    });
    setShowAddModal(false);
    setTxForm({ type: 'expense', amount: '', category: 'طعام', note: '', date: format(new Date(), 'yyyy-MM-dd') });
  };

  const totalIncome = (state.transactions || [])
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = (state.transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Calculate commitments for the current month
  const activeCommitments = (state.commitments || []).filter(c => c.status === 'active');
  const totalCommitments = activeCommitments.reduce((acc, c) => acc + c.amount, 0);
  
  const remainingSalary = state.monthlySalary - totalCommitments;

  // Calculate real category data for expenses
  const expenseTransactions = (state.transactions || []).filter(t => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};
  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f97316'];
  const categoryData = Object.entries(categoryTotals)
    .map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الإدارة المالية (Finance Hub)</h2>
          <p className="text-white/50 mt-1">تتبع دخلك ومصروفاتك وحلل عاداتك الشرائية بدقة.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="glass-button px-4 py-2 text-xs font-bold flex items-center gap-2">
            <TrendingUp size={16} />
            تقرير شهري
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20">
            <Plus size={20} />
            إضافة معاملة
          </button>
        </div>
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-500/10 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/40 font-medium">الرصيد الكلي</span>
            <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
              <Wallet size={20} />
            </div>
          </div>
          <div className="text-4xl font-black tracking-tight">{balance.toLocaleString()} <span className="text-sm font-normal text-white/40">ج.م</span></div>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} />
            <span>+12% عن الشهر الماضي</span>
          </div>
        </div>

        <div className="glass-card p-6 border-brand-500/20 bg-brand-500/5 relative group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/40 font-medium">المرتب الشهري</span>
            <button 
              onClick={() => setShowSalaryEdit(!showSalaryEdit)}
              className="p-2 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors"
            >
              <CreditCard size={20} />
            </button>
          </div>
          {showSalaryEdit ? (
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-lg font-bold w-full outline-none focus:border-brand-500"
              />
              <button 
                onClick={() => {
                  setMonthlySalary(Number(salaryInput));
                  setShowSalaryEdit(false);
                }}
                className="bg-brand-500 p-2 rounded-lg"
              >
                <CheckCircle2 size={16} />
              </button>
            </div>
          ) : (
            <div className="text-3xl font-bold text-brand-400 tracking-tight">{state.monthlySalary.toLocaleString()} <span className="text-sm font-normal text-white/40">ج.م</span></div>
          )}
          <div className="mt-4 text-[10px] text-white/30 uppercase font-bold">الميزانية الأساسية</div>
        </div>

        <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/40 font-medium">إجمالي الدخل</span>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 tracking-tight">{totalIncome.toLocaleString()} <span className="text-sm font-normal text-white/40">ج.م</span></div>
          <div className="mt-4 text-[10px] text-white/30 uppercase font-bold">هذا الشهر</div>
        </div>

        <div className="glass-card p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/40 font-medium">إجمالي المصروفات</span>
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-red-400 tracking-tight">{totalExpense.toLocaleString()} <span className="text-sm font-normal text-white/40">ج.م</span></div>
          <div className="mt-4 text-[10px] text-white/30 uppercase font-bold">هذا الشهر</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Salary Breakdown / Planner */}
          <div className="glass-card p-6 bg-gradient-to-br from-brand-500/5 to-transparent border-brand-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target className="text-brand-400" size={20} />
                مخطط الميزانية (Budget Planner)
              </h3>
              <div className="text-xs font-bold px-3 py-1 rounded-full bg-brand-500/20 text-brand-400">
                المتبقي من المرتب: {remainingSalary.toLocaleString()} ج.م
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-xs text-white/40 mb-1">إجمالي الالتزامات (أقساط/جمعيات)</div>
                  <div className="text-2xl font-bold text-red-400">{totalCommitments.toLocaleString()} ج.م</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-xs text-white/40 mb-1">نسبة الالتزامات من المرتب</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-500" 
                        style={{ width: `${Math.min((totalCommitments / state.monthlySalary) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{Math.round((totalCommitments / state.monthlySalary) * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10 italic text-center">
                <p className="text-sm text-white/60">
                  بعد دفع التزاماتك يوم {format(new Date(), 'd')} من الشهر، سيبقى معك{' '}
                  <span className="text-brand-400 font-bold">{remainingSalary.toLocaleString()} ج.م</span>
                  {' '}لتغطية باقي مصاريف الشهر.
                </p>
              </div>
            </div>
          </div>

          {/* Financial Commitments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="text-brand-400" size={20} />
                الالتزامات المالية (أقساط وجمعيات)
              </h3>
              <button className="text-xs text-brand-400 font-bold hover:underline">إضافة التزام</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(state.commitments || []).map(commitment => {
                const daysLeft = differenceInDays(new Date(commitment.dueDate), new Date());
                const isUrgent = daysLeft <= 5 && daysLeft >= 0;
                
                return (
                  <div key={commitment.id} className="glass-card p-5 border-white/10 hover:border-brand-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          commitment.type === 'jam-eya' ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                        )}>
                          {commitment.type === 'jam-eya' ? <Target size={20} /> : <CreditCard size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold">{commitment.name}</h4>
                          <span className="text-[10px] text-white/40 uppercase font-bold">{commitment.type === 'jam-eya' ? 'جمعية' : 'قسط شهري'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{commitment.amount.toLocaleString()} ج.م</div>
                        <div className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded",
                          isUrgent ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/40"
                        )}>
                          {daysLeft < 0 ? 'متأخر' : `باقي ${daysLeft} يوم`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        موعد الدفع: {format(new Date(commitment.dueDate), 'd MMMM', { locale: ar })}
                      </div>
                      {commitment.totalInstallments && (
                        <div className="font-bold">
                          {commitment.paidInstallments}/{commitment.totalInstallments}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wishlist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="text-brand-400" size={20} />
                قائمة الأمنيات (Wishlist)
              </h3>
              <button className="text-xs text-brand-400 font-bold hover:underline">إضافة منتج</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(state.wishlist || []).map(item => {
                const progress = (item.savedAmount / item.price) * 100;
                
                return (
                  <div key={item.id} className="glass-card p-5 border-white/10 hover:border-brand-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold">{item.name}</h4>
                        <span className="text-[10px] text-white/40 uppercase font-bold">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{item.price.toLocaleString()} ج.م</div>
                        <div className="text-[10px] text-brand-400 font-bold">الأولوية: {item.priority === 'high' ? 'عالية' : 'متوسطة'}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-white/40">تم توفير: {item.savedAmount.toLocaleString()} ج.م</span>
                        <span className="text-brand-400">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-500 transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">آخر المعاملات</h3>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    placeholder="بحث..." 
                    className="bg-white/5 border border-white/10 rounded-lg pr-10 pl-4 py-2 text-xs outline-none focus:border-brand-500/50 transition-all"
                  />
                </div>
                <button className="glass-button p-2">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {state.transactions.map(tr => (
                <div key={tr.id} className="glass-card p-4 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      tr.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {tr.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold">{tr.category}</h4>
                      <p className="text-xs text-white/40">{tr.note || 'بدون ملاحظات'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-bold text-lg tracking-tight",
                      tr.type === 'income' ? "text-emerald-400" : "text-white"
                    )}>
                      {tr.type === 'income' ? '+' : '-'}{tr.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/20 font-bold uppercase">
                      {format(new Date(tr.date), 'd MMMM', { locale: ar })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-brand-400" />
              توزيع المصروفات
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: -20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#ffffff40" fontSize={12} axisLine={false} tickLine={false} width={80} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {categoryData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white/60">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value.toLocaleString()} ج.م</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 bg-brand-500/5 border-brand-500/10">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-400" />
              نصيحة مالية ذكية
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              {totalCommitments / state.monthlySalary > 0.5 ? (
                <>
                  تحذير: التزاماتك الشهرية تتجاوز <span className="text-red-400 font-bold">50%</span> من دخلك. 
                  يُنصح بمراجعة المصاريف غير الضرورية أو محاولة تقليل الأقساط الجديدة لتجنب الضغط المالي.
                </>
              ) : totalCommitments / state.monthlySalary > 0.3 ? (
                <>
                  ميزانيتك في وضع <span className="text-yellow-400 font-bold">متوسط</span>. 
                  التزاماتك تشكل حوالي {Math.round((totalCommitments / state.monthlySalary) * 100)}% من دخلك. 
                  حاول الحفاظ على هذا المستوى وعدم الدخول في التزامات جديدة حالياً.
                </>
              ) : (
                <>
                  وضعك المالي <span className="text-emerald-400 font-bold">ممتاز</span>! 
                  التزاماتك تشكل أقل من 30% من دخلك. 
                  يمكنك التفكير في زيادة مبلغ الادخار أو الاستثمار في قائمة أمنياتك بشكل أسرع.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
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
              className="relative w-full max-w-md glass-card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">إضافة معاملة</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-5">
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'expense', category: 'طعام' })}
                    className={cn("flex-1 py-2.5 rounded-lg text-sm font-bold transition-all", txForm.type === 'expense' ? "bg-red-500/20 text-red-400" : "text-white/40 hover:text-white/60")}
                  >
                    مصروف
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'income', category: 'مرتب' })}
                    className={cn("flex-1 py-2.5 rounded-lg text-sm font-bold transition-all", txForm.type === 'income' ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white/60")}
                  >
                    دخل
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">المبلغ (ج.م)</label>
                  <input
                    autoFocus required type="number" min="1"
                    value={txForm.amount}
                    onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">الفئة</label>
                    <select
                      value={txForm.category}
                      onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50"
                    >
                      {(txForm.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">التاريخ</label>
                    <input
                      type="date"
                      value={txForm.date}
                      onChange={e => setTxForm({ ...txForm, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">ملاحظة (اختياري)</label>
                  <input
                    value={txForm.note}
                    onChange={e => setTxForm({ ...txForm, note: e.target.value })}
                    placeholder="مثال: غداء مع الزملاء"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className={cn(
                    "w-full font-bold py-3 rounded-xl transition-all",
                    txForm.type === 'expense' ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  )}
                >
                  {txForm.type === 'expense' ? 'تسجيل المصروف' : 'تسجيل الدخل'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceSystem;