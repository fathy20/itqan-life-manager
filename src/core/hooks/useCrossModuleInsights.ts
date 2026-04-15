import { useState, useEffect } from 'react';
import { tasksApiNew, projectsApiNew, financeApiNew } from '../../lib/api';
import { useAppStore } from '../store/useAppStore';

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral';
  actionable: boolean;
  actionPath?: string;
}

export function useCrossModuleInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const addNotification = useAppStore((state) => state.addNotification);

  useEffect(() => {
    async function analyzeData() {
      setLoading(true);
      try {
        const [tasksRes, projectsRes, financeRes] = await Promise.all([
          tasksApiNew.list(),
          projectsApiNew.list(),
          financeApiNew.listTransactions ? financeApiNew.listTransactions() : Promise.resolve({ success: true, data: [] }),
        ]);

        const tasks = tasksRes.data || [];
        const projects = projectsRes.data || [];
        // @ts-ignore
        const transactions = financeRes.data || [];

        const pendingTasks = tasks.filter((t: any) => !t.completed);
        const lateTasks = pendingTasks.filter((t: any) => t.deadline && new Date(t.deadline) < new Date());
        
        let newInsights: Insight[] = [];

        if (lateTasks.length > 5) {
          newInsights.push({
            id: 'high-late-tasks',
            title: 'تراكم المهام',
            description: `تراكم لديك ${lateTasks.length} مهام متأخرة، ينصح بإعادة جدولتها أو تخصيص جلسة تركيز فورية لها.`,
            type: 'warning',
            actionable: true,
            actionPath: 'focus'
          });
          
          addNotification({
            title: 'تنبيه إنتاجية',
            message: 'تراكم لديك العديد من المهام المتأخرة!',
            type: 'warning',
            module: 'work'
          });
        }

        const activeProjects = projects.filter((p: any) => p.status === 'active');
        if (activeProjects.length > 3 && pendingTasks.length > 15) {
          newInsights.push({
            id: 'project-overload',
            title: 'ضغط العمل مرتفع',
            description: 'تعمل على أكثر من ٣ مشاريع نشطة متزامنة، حاول إنهاء أحدها قبل البدء في جديد لتجنب التشتت.',
            type: 'warning',
            actionable: false,
          });
        }

        if (tasks.length > 0 && pendingTasks.length / tasks.length < 0.2) {
            newInsights.push({
                id: 'excellent-completion',
                title: 'أداء ممتاز',
                description: 'معدل إنجاز مهامك يتجاوز ٨٠٪، استمر في هذا الأداء الرائع!',
                type: 'positive',
                actionable: false
            });
        }

        setInsights(newInsights);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    }

    analyzeData();
  }, []);

  return { insights, loading };
}
