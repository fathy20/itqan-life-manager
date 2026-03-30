import { db } from "../../lib/firebase-admin";

export interface IntelligenceReport {
  lifeScore: number;
  burnout: { level: "low" | "medium" | "high"; signals: string[] };
  examRisks: { name: string; risk: "safe" | "warning" | "danger"; daysLeft: number; dailyLoad: number }[];
  financeRisk: { score: number; alerts: string[] };
  habitConsistency: { overall: number; habits: { name: string; rate7d: number; streak: number }[] };
  topPriorities: { type: string; title: string; urgency: number; action: string }[];
}

export async function computeIntelligence(uid: string): Promise<IntelligenceReport> {
  const today = new Date().toISOString().split("T")[0];
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split("T")[0]; });

  const [subjectsSnap, tasksSnap, transSnap, commitmentsSnap, habitsSnap, logsSnap] = await Promise.all([
    db.collection("users").doc(uid).collection("subjects").get(),
    db.collection("users").doc(uid).collection("tasks").get(),
    db.collection("users").doc(uid).collection("transactions").orderBy("date", "desc").limit(30).get(),
    db.collection("users").doc(uid).collection("commitments").where("status", "==", "active").get(),
    db.collection("users").doc(uid).collection("habits").get(),
    db.collection("users").doc(uid).collection("lifestyle_logs").orderBy("date", "desc").limit(7).get(),
  ]);

  const subjects = subjectsSnap.docs.map(d => d.data() as any);
  const tasks = tasksSnap.docs.map(d => d.data() as any);
  const transactions = transSnap.docs.map(d => d.data() as any);
  const commitments = commitmentsSnap.docs.map(d => d.data() as any);
  const habits = habitsSnap.docs.map(d => d.data() as any);
  const logs = logsSnap.docs.map(d => d.data() as any);

  // ── Life Score ────────────────────────────────────────────
  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const taskScore = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 50;

  const studyProgress = subjects.length > 0
    ? subjects.reduce((acc: number, s: any) => acc + (s.totalLectures > 0 ? s.completedLectures / s.totalLectures : 0), 0) / subjects.length * 100
    : 50;

  const income = transactions.filter((t: any) => t.type === "income").reduce((a: number, t: any) => a + t.amount, 0);
  const expense = transactions.filter((t: any) => t.type === "expense").reduce((a: number, t: any) => a + t.amount, 0);
  const financeScore = income > 0 ? Math.min(((income - expense) / income) * 100 + 50, 100) : 50;

  const habitScore = habits.length > 0
    ? habits.reduce((acc: number, h: any) => acc + (last7.filter(d => (h.completedDates || []).includes(d)).length / 7), 0) / habits.length * 100
    : 50;

  const lifeScore = Math.round((taskScore * 0.25) + (studyProgress * 0.25) + (financeScore * 0.25) + (habitScore * 0.25));

  // ── Burnout Detection ─────────────────────────────────────
  const pendingTasks = tasks.filter((t: any) => t.status !== "completed").length;
  const avgSleep = logs.length > 0 ? logs.reduce((a: number, l: any) => a + (l.sleepHours || 0), 0) / logs.length : 7;
  const avgPhone = logs.length > 0 ? logs.reduce((a: number, l: any) => a + (l.phoneUsageMinutes || 0), 0) / logs.length : 120;

  const burnoutSignals: string[] = [];
  if (pendingTasks > 8) burnoutSignals.push(`${pendingTasks} مهمة متراكمة`);
  if (avgSleep < 6) burnoutSignals.push(`معدل نوم منخفض (${avgSleep.toFixed(1)} ساعة)`);
  if (avgPhone > 360) burnoutSignals.push(`استخدام هاتف مرتفع (${Math.round(avgPhone / 60)} ساعة/يوم)`);

  const burnoutLevel = burnoutSignals.length >= 3 ? "high" : burnoutSignals.length >= 1 ? "medium" : "low";

  // ── Exam Risks ────────────────────────────────────────────
  const examRisks = subjects
    .filter((s: any) => s.examDate >= today)
    .map((s: any) => {
      const daysLeft = Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000);
      const remaining = (s.totalLectures || 0) - (s.completedLectures || 0);
      const dailyLoad = daysLeft > 0 ? remaining / daysLeft : 999;
      const risk = dailyLoad > 4 ? "danger" : dailyLoad > 2 ? "warning" : "safe";
      return { name: s.name, risk, daysLeft, dailyLoad: Math.round(dailyLoad * 10) / 10 };
    })
    .sort((a: any, b: any) => a.daysLeft - b.daysLeft);

  // ── Finance Risk ──────────────────────────────────────────
  const totalCommitments = commitments.reduce((a: number, c: any) => a + c.amount, 0);
  const financeAlerts: string[] = [];
  if (income > 0 && expense / income > 0.8) financeAlerts.push("المصروفات تتجاوز 80% من الدخل");
  if (income > 0 && totalCommitments / income > 0.5) financeAlerts.push("الالتزامات تتجاوز 50% من الدخل");
  if (income - expense < 0) financeAlerts.push("المصروفات تتجاوز الدخل هذا الشهر");
  const financeRiskScore = Math.max(0, 100 - financeAlerts.length * 30);

  // ── Habit Consistency ─────────────────────────────────────
  const habitDetails = habits.map((h: any) => ({
    name: h.name,
    rate7d: Math.round(last7.filter(d => (h.completedDates || []).includes(d)).length / 7 * 100),
    streak: h.streak || 0,
  }));
  const overallHabit = habitDetails.length > 0 ? Math.round(habitDetails.reduce((a: number, h: any) => a + h.rate7d, 0) / habitDetails.length) : 0;

  // ── Top Priorities ────────────────────────────────────────
  const priorities: any[] = [];

  examRisks.filter((e: any) => e.risk === "danger" || e.daysLeft <= 7).forEach((e: any) => {
    priorities.push({ type: "exam", title: `امتحان ${e.name}`, urgency: 100 - e.daysLeft * 5, action: `ذاكر ${e.dailyLoad} محاضرة يومياً` });
  });

  tasks.filter((t: any) => t.priority === "high" && t.status !== "completed").slice(0, 3).forEach((t: any) => {
    priorities.push({ type: "task", title: t.title, urgency: 70, action: "أنجز هذه المهمة اليوم" });
  });

  financeAlerts.forEach(alert => {
    priorities.push({ type: "finance", title: alert, urgency: 60, action: "راجع ميزانيتك" });
  });

  priorities.sort((a, b) => b.urgency - a.urgency);

  return {
    lifeScore,
    burnout: { level: burnoutLevel, signals: burnoutSignals },
    examRisks,
    financeRisk: { score: financeRiskScore, alerts: financeAlerts },
    habitConsistency: { overall: overallHabit, habits: habitDetails },
    topPriorities: priorities.slice(0, 5),
  };
}
