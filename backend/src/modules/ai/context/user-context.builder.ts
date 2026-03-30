import { db } from "../../../lib/firebase-admin";

export interface UserContext {
  profile: { name: string; role: string; university: string };
  subjects: { name: string; examDate: string; completedLectures: number; totalLectures: number; difficulty: string }[];
  tasks: { title: string; type: string; priority: string; deadline?: string }[];
  projects: { name: string; type: string; status: string }[];
  courses: { name: string; completedHours: number; totalHours: number }[];
  finance: { balance: number; monthlyIncome: number; monthlyExpense: number; commitments: number };
  habits: { name: string; streak: number; completionRate7d: number }[];
  lifestyle: { avgSleepHours: number; avgPhoneMinutes: number; avgWaterIntake: number; avgSteps: number };
  computed: {
    daysUntilNextExam: number;
    nextExamName: string;
    pendingTaskCount: number;
    habitCompletionRate: number;
    focusSessionsThisWeek: number;
  };
}

export async function buildUserContext(uid: string): Promise<UserContext> {
  const today = new Date().toISOString().split("T")[0];

  const [profileSnap, subjectsSnap, tasksSnap, projectsSnap, coursesSnap, transSnap, commitmentsSnap, habitsSnap, logsSnap, focusSnap] = await Promise.all([
    db.collection("users").doc(uid).get(),
    db.collection("users").doc(uid).collection("subjects").get(),
    db.collection("users").doc(uid).collection("tasks").where("status", "!=", "completed").get(),
    db.collection("users").doc(uid).collection("projects").where("status", "==", "ongoing").get(),
    db.collection("users").doc(uid).collection("courses").get(),
    db.collection("users").doc(uid).collection("transactions").orderBy("date", "desc").limit(30).get(),
    db.collection("users").doc(uid).collection("commitments").where("status", "==", "active").get(),
    db.collection("users").doc(uid).collection("habits").get(),
    db.collection("users").doc(uid).collection("lifestyle_logs").orderBy("date", "desc").limit(7).get(),
    db.collection("users").doc(uid).collection("focus_sessions").orderBy("createdAt", "desc").limit(20).get(),
  ]);

  const profile = profileSnap.data() || {};
  const subjects = subjectsSnap.docs.map(d => d.data() as any);
  const tasks = tasksSnap.docs.map(d => d.data() as any);
  const transactions = transSnap.docs.map(d => d.data() as any);
  const commitments = commitmentsSnap.docs.map(d => d.data() as any);
  const habits = habitsSnap.docs.map(d => d.data() as any);
  const logs = logsSnap.docs.map(d => d.data() as any);

  // Finance
  const monthlyIncome = transactions.filter((t: any) => t.type === "income").reduce((a: number, t: any) => a + t.amount, 0);
  const monthlyExpense = transactions.filter((t: any) => t.type === "expense").reduce((a: number, t: any) => a + t.amount, 0);
  const totalCommitments = commitments.reduce((a: number, c: any) => a + c.amount, 0);

  // Next exam
  const upcomingExams = subjects.filter((s: any) => s.examDate >= today).sort((a: any, b: any) => a.examDate.localeCompare(b.examDate));
  const nextExam = upcomingExams[0];
  const daysUntilNextExam = nextExam ? Math.ceil((new Date(nextExam.examDate).getTime() - Date.now()) / 86400000) : 999;

  // Habits completion rate (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split("T")[0]; });
  const habitCompletionRate = habits.length > 0
    ? Math.round(habits.reduce((acc: number, h: any) => acc + (last7.filter(d => (h.completedDates || []).includes(d)).length / 7), 0) / habits.length * 100)
    : 0;

  // Lifestyle averages
  const avgSleepHours = logs.length > 0 ? logs.reduce((a: number, l: any) => a + (l.sleepHours || 0), 0) / logs.length : 0;
  const avgPhoneMinutes = logs.length > 0 ? logs.reduce((a: number, l: any) => a + (l.phoneUsageMinutes || 0), 0) / logs.length : 0;
  const avgWaterIntake = logs.length > 0 ? logs.reduce((a: number, l: any) => a + (l.waterIntake || 0), 0) / logs.length : 0;
  const avgSteps = logs.length > 0 ? logs.reduce((a: number, l: any) => a + (l.steps || 0), 0) / logs.length : 0;

  // Focus sessions this week
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const focusSessionsThisWeek = focusSnap.docs.filter(d => new Date(d.data().createdAt || "") >= weekAgo).length;

  return {
    profile: { name: profile.name || "", role: profile.role || "", university: profile.university || "" },
    subjects: subjects.map((s: any) => ({ name: s.name, examDate: s.examDate, completedLectures: s.completedLectures || 0, totalLectures: s.totalLectures || 0, difficulty: s.difficulty || "medium" })),
    tasks: tasks.map((t: any) => ({ title: t.title, type: t.type, priority: t.priority, deadline: t.deadline })),
    projects: projectsSnap.docs.map(d => { const p = d.data() as any; return { name: p.name, type: p.type, status: p.status }; }),
    courses: coursesSnap.docs.map(d => { const c = d.data() as any; return { name: c.name, completedHours: c.completedHours || 0, totalHours: c.totalHours || 0 }; }),
    finance: { balance: monthlyIncome - monthlyExpense, monthlyIncome, monthlyExpense, commitments: totalCommitments },
    habits: habits.map((h: any) => ({ name: h.name, streak: h.streak || 0, completionRate7d: Math.round(last7.filter(d => (h.completedDates || []).includes(d)).length / 7 * 100) })),
    lifestyle: { avgSleepHours: Math.round(avgSleepHours * 10) / 10, avgPhoneMinutes: Math.round(avgPhoneMinutes), avgWaterIntake: Math.round(avgWaterIntake * 10) / 10, avgSteps: Math.round(avgSteps) },
    computed: { daysUntilNextExam, nextExamName: nextExam?.name || "", pendingTaskCount: tasks.length, habitCompletionRate, focusSessionsThisWeek },
  };
}
