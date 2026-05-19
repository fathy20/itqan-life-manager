// ═══════════════════════════════════════════════════════════════
//  src/core/hooks/useCrossModuleInsights.ts
//  Intelligence Engine — reads from Work + Finance + Health modules
//  Generates real cross-module insights, alerts and recommendations
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { tasksApiNew, projectsApiNew, financeApiNew, habitsApiNew } from '../../lib/api/index';
import { useAppStore, type AppNotification } from '../store/useAppStore';
import type { Task, Project, Transaction, Habit } from '../../types/new';

// ─── Public Types ─────────────────────────────────────────────

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral' | 'critical';
  category: 'work' | 'finance' | 'health' | 'general';
  actionable: boolean;
  actionPath?: string;
  actionLabel?: string;
  metric?: { label: string; value: string; trend?: 'up' | 'down' | 'stable' };
}

export interface WorkSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  lateTasks: number;
  completionRate: number;            // 0–100
  activeProjects: number;
  overdueProjects: Project[];
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  totalSadaqah: number;
  balance: number;
  expenseRatio: number;             // expense / income, 0–1
  monthlyTransactions: number;
}

export interface DailyBrief {
  greeting: string;
  todayTaskCount: number;
  todayDoneCount: number;
  completionPercent: number;
  urgentCount: number;
  insights: Insight[];
  financeSummary: FinanceSummary | null;
  workSummary: WorkSummary | null;
}

export interface CrossModuleData {
  insights: Insight[];
  dailyBrief: DailyBrief;
  workSummary: WorkSummary | null;
  financeSummary: FinanceSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────

function buildGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return 'قيام الليل مبارك';
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'مساء النور';
  return 'مساء الخير';
}

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr.startsWith(today);
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);
}

function buildWorkSummary(tasks: Task[], projects: Project[]): WorkSummary {
  const completed  = tasks.filter(t => t.completed);
  const pending    = tasks.filter(t => !t.completed);
  const late       = pending.filter(t => isOverdue(t.deadline));
  const active     = projects.filter(p => p.status === 'active');
  const overdueP   = active.filter(p => p.deadline && isOverdue(p.deadline));
  const rate       = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  return {
    totalTasks:      tasks.length,
    completedTasks:  completed.length,
    pendingTasks:    pending.length,
    lateTasks:       late.length,
    completionRate:  rate,
    activeProjects:  active.length,
    overdueProjects: overdueP,
  };
}

function buildFinanceSummary(transactions: Transaction[]): FinanceSummary {
  const income  = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const sadaqah = transactions.filter(t => t.type === 'sadaqah').reduce((a, t) => a + t.amount, 0);

  return {
    totalIncome:          income,
    totalExpense:         expense,
    totalSadaqah:         sadaqah,
    balance:              income - expense - sadaqah,
    expenseRatio:         income > 0 ? expense / income : 0,
    monthlyTransactions:  transactions.length,
  };
}

function generateInsights(
  work: WorkSummary,
  finance: FinanceSummary,
  habits: Habit[],
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void
): Insight[] {
  const insights: Insight[] = [];

  // ── Work Insights ────────────────────────────────────────────

  if (work.lateTasks > 5) {
    insights.push({
      id: 'high-late-tasks',
      title: 'تراكم المهام المتأخرة',
      description: `لديك ${work.lateTasks} مهمة متأخرة. ينصح بتخصيص جلسة تركيز عميق لإعادة الضبط.`,
      type: 'critical',
      category: 'work',
      actionable: true,
      actionPath: 'focus',
      actionLabel: 'ابدأ جلسة تركيز',
      metric: { label: 'مهام متأخرة', value: String(work.lateTasks), trend: 'down' },
    });
    addNotification({
      title: 'تنبيه إنتاجية',
      message: `تراكم ${work.lateTasks} مهام متأخرة — حان وقت التصحيح!`,
      type: 'warning',
      module: 'work',
    });
  } else if (work.lateTasks > 0) {
    insights.push({
      id: 'some-late-tasks',
      title: 'مهام تحتاج متابعة',
      description: `لديك ${work.lateTasks} مهمة تجاوزت موعدها. راجعها قبل إضافة مهام جديدة.`,
      type: 'warning',
      category: 'work',
      actionable: true,
      actionPath: 'work',
      actionLabel: 'راجع المهام',
      metric: { label: 'مهام متأخرة', value: String(work.lateTasks) },
    });
  }

  if (work.completionRate >= 80) {
    insights.push({
      id: 'excellent-completion',
      title: 'أداء استثنائي في الإنجاز',
      description: `معدل إنجازك ${work.completionRate}٪ — أداء ممتاز! استمر في هذا المستوى.`,
      type: 'positive',
      category: 'work',
      actionable: false,
      metric: { label: 'معدل الإنجاز', value: `${work.completionRate}%`, trend: 'up' },
    });
  } else if (work.completionRate < 40 && work.totalTasks > 5) {
    insights.push({
      id: 'low-completion',
      title: 'معدل إنجاز منخفض',
      description: `معدل إنجازك ${work.completionRate}٪ فقط. جرّب تقسيم المهام لأجزاء أصغر لتحقيق زخم.`,
      type: 'warning',
      category: 'work',
      actionable: true,
      actionPath: 'work',
      actionLabel: 'راجع خطتك',
      metric: { label: 'معدل الإنجاز', value: `${work.completionRate}%`, trend: 'down' },
    });
  }

  if (work.activeProjects > 3 && work.pendingTasks > 15) {
    insights.push({
      id: 'project-overload',
      title: 'ضغط العمل مرتفع جداً',
      description: `تعمل على ${work.activeProjects} مشاريع مع ${work.pendingTasks} مهمة معلقة. التشتت له ثمن — ركّز على الأهم.`,
      type: 'warning',
      category: 'work',
      actionable: true,
      actionPath: 'intelligence',
      actionLabel: 'اقرأ التوصيات',
    });
  }

  if (work.overdueProjects.length > 0) {
    insights.push({
      id: 'overdue-projects',
      title: 'مشاريع تجاوزت موعد التسليم',
      description: `${work.overdueProjects.length} مشروع تجاوز أو اقترب من الموعد النهائي: ${work.overdueProjects.map(p => p.name).join('، ')}.`,
      type: 'critical',
      category: 'work',
      actionable: true,
      actionPath: 'work',
      actionLabel: 'راجع المشاريع',
    });
    addNotification({
      title: 'مشاريع تحتاج تدخلاً',
      message: `${work.overdueProjects.length} مشروع على وشك التأخر!`,
      type: 'alert',
      module: 'work',
    });
  }

  // ── Finance Insights ─────────────────────────────────────────

  if (finance.totalIncome > 0) {
    if (finance.expenseRatio > 0.85) {
      insights.push({
        id: 'high-expense-ratio',
        title: 'معدل الصرف مرتفع',
        description: `أنت تصرف ${Math.round(finance.expenseRatio * 100)}٪ من دخلك. ابحث عن مصروفات يمكن تخفيضها لحماية رصيدك.`,
        type: 'warning',
        category: 'finance',
        actionable: true,
        actionPath: 'finance',
        actionLabel: 'راجع المصروفات',
        metric: { label: 'نسبة الصرف', value: `${Math.round(finance.expenseRatio * 100)}%`, trend: 'up' },
      });
      addNotification({
        title: 'تنبيه مالي',
        message: `معدل الصرف وصل ${Math.round(finance.expenseRatio * 100)}٪ من الدخل!`,
        type: 'warning',
        module: 'finance',
      });
    } else if (finance.balance > 0 && finance.expenseRatio < 0.5) {
      insights.push({
        id: 'good-savings',
        title: 'صحة مالية جيدة',
        description: `تصرف ${Math.round(finance.expenseRatio * 100)}٪ فقط من دخلك. رصيدك الإيجابي يتيح لك الادخار أو الاستثمار.`,
        type: 'positive',
        category: 'finance',
        actionable: false,
        metric: { label: 'الرصيد', value: `${finance.balance.toLocaleString()} ج`, trend: 'up' },
      });
    }

    if (finance.totalSadaqah > 0) {
      const sadaqahRate = Math.round((finance.totalSadaqah / finance.totalIncome) * 100);
      if (sadaqahRate >= 2.5) {
        insights.push({
          id: 'good-sadaqah',
          title: 'نسبة صدقات مباركة',
          description: `أنت تُخرج ${sadaqahRate}٪ من دخلك صدقة. هذا استثمار في الآخرة وبركة في الرزق.`,
          type: 'positive',
          category: 'finance',
          actionable: false,
        });
      }
    }
  }

  // ── Cross-Module Insights ─────────────────────────────────────

  if (work.lateTasks > 3 && finance.expenseRatio > 0.75) {
    insights.push({
      id: 'work-finance-pressure',
      title: 'ضغط مزدوج: عمل وماليات',
      description: 'تراكم المهام مع ارتفاع المصروفات يشير لضغط عام. خصص وقتاً لإعادة التنظيم والتخطيط.',
      type: 'critical',
      category: 'general',
      actionable: true,
      actionPath: 'intelligence',
      actionLabel: 'اقرأ خطة التعافي',
    });
  }

  // ── Habits ───────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  if (habits.length > 0) {
    const completedToday = habits.filter(h => h.completedDates?.includes(today));
    const habitRate = Math.round((completedToday.length / habits.length) * 100);
    if (habitRate === 100) {
      insights.push({
        id: 'all-habits-done',
        title: 'جميع العادات مكتملة اليوم',
        description: `أتممت ${habits.length} عادة اليوم — أنت في القمة! الانضباط هو أساس النجاح.`,
        type: 'positive',
        category: 'health',
        actionable: false,
        metric: { label: 'معدل العادات', value: '100%', trend: 'up' },
      });
    } else if (habitRate < 30 && habits.length >= 3) {
      insights.push({
        id: 'low-habit-rate',
        title: 'العادات اليومية تحتاج اهتماماً',
        description: `أكملت ${completedToday.length} من ${habits.length} عادات فقط اليوم. الثبات يُبنى بخطوات صغيرة.`,
        type: 'neutral',
        category: 'health',
        actionable: true,
        actionPath: 'lifestyle',
        actionLabel: 'سجّل العادات',
      });
    }
  }

  return insights;
}

// ─── Main Hook ────────────────────────────────────────────────

export function useCrossModuleInsights(): CrossModuleData {
  const [insights, setInsights]             = useState<Insight[]>([]);
  const [workSummary, setWorkSummary]       = useState<WorkSummary | null>(null);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  const addNotification = useAppStore(state => state.addNotification);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [tasksRes, projectsRes, financeRes, habitsRes] = await Promise.allSettled([
        tasksApiNew.list(),
        projectsApiNew.list(),
        financeApiNew.transactions.list(),
        habitsApiNew.list(),
      ]);

      const tasks       = tasksRes.status === 'fulfilled' && tasksRes.value.success    ? (tasksRes.value.data   ?? []) : [];
      const projects    = projectsRes.status === 'fulfilled' && projectsRes.value.success ? (projectsRes.value.data ?? []) : [];
      const transactions = financeRes.status === 'fulfilled' && financeRes.value.success  ? (financeRes.value.data ?? []) : [];
      const habits      = habitsRes.status === 'fulfilled' && habitsRes.value.success   ? (habitsRes.value.data  ?? []) : [];

      const ws = buildWorkSummary(tasks, projects);
      const fs = buildFinanceSummary(transactions);
      const is = generateInsights(ws, fs, habits, addNotification);

      setWorkSummary(ws);
      setFinanceSummary(fs);
      setInsights(is);
    } catch (err) {
      setError('فشل تحميل بيانات التحليل. تحقق من الاتصال.');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => { analyze(); }, [analyze]);

  // Build Daily Brief
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = workSummary
    ? [] // We'd need raw tasks here — see extended version below
    : [];

  const dailyBrief: DailyBrief = {
    greeting:          buildGreeting(),
    todayTaskCount:    workSummary?.pendingTasks ?? 0,
    todayDoneCount:    workSummary?.completedTasks ?? 0,
    completionPercent: workSummary?.completionRate ?? 0,
    urgentCount:       workSummary?.lateTasks ?? 0,
    insights:          insights.slice(0, 3),
    financeSummary,
    workSummary,
  };

  return { insights, dailyBrief, workSummary, financeSummary, loading, error, refetch: analyze };
}
