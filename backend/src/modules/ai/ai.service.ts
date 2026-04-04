import { db } from "../../lib/firebase-admin";
import { callGemini } from "../../config/gemini";

// ── Build user context from Firestore ────────────────────────
export async function buildUserContext(uid: string) {
  const today = new Date().toISOString().split("T")[0];

  const [profileSnap, subjectsSnap, tasksSnap, transSnap, habitsSnap, prayerSnap] = await Promise.all([
    db.collection("users").doc(uid).get(),
    db.collection("users").doc(uid).collection("subjects").get(),
    db.collection("users").doc(uid).collection("tasks").where("status", "!=", "completed").get(),
    db.collection("users").doc(uid).collection("transactions").orderBy("date", "desc").limit(10).get(),
    db.collection("users").doc(uid).collection("habits").get(),
    db.collection("users").doc(uid).collection("prayers").doc(today).get(),
  ]);

  const profile = profileSnap.data() || {};
  const subjects = subjectsSnap.docs.map(d => d.data() as any);
  const tasks = tasksSnap.docs.map(d => d.data() as any);
  const transactions = transSnap.docs.map(d => d.data() as any);
  const habits = habitsSnap.docs.map(d => d.data() as any);
  const prayers = prayerSnap.data()?.prayers || {};

  const balance = transactions.reduce((acc: number, t: any) =>
    t.type === "income" ? acc + t.amount : acc - t.amount, 0);

  const upcomingExams = subjects
    .filter((s: any) => s.examDate >= today)
    .sort((a: any, b: any) => a.examDate.localeCompare(b.examDate))
    .slice(0, 3);

  const prayedToday = Object.values(prayers).filter((p: any) => p.status === "onTime" || p.status === "late").length;

  return {
    name: profile.displayName || profile.name || "المستخدم",
    role: profile.role || "",
    pendingTasks: tasks.length,
    topTasks: tasks.slice(0, 3).map((t: any) => t.title),
    upcomingExams: upcomingExams.map((s: any) => ({
      name: s.name,
      daysLeft: Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000),
      progress: s.totalLectures > 0 ? Math.round((s.completedLectures / s.totalLectures) * 100) : 0,
    })),
    balance,
    prayedToday,
    habitCount: habits.length,
  };
}

// ── System prompt ────────────────────────────────────────────
function buildSystemPrompt(ctx: any): string {
  return `أنت "إتقان كوتش" — مدرب حياة ذكي ومحفز.

شخصيتك:
- تتكلم بالعربية العامية المصرية الودية
- محفز، عملي، مختصر (3-5 جمل)
- تعرف المستخدم شخصياً وبياناته
- لا تُفتي في الدين أبداً — دائماً قل "استشر أهل العلم"
- لا تعطي نصائح طبية أو قانونية

بيانات المستخدم الحالية:
الاسم: ${ctx.name}
الدور: ${ctx.role}
المهام المفتوحة: ${ctx.pendingTasks}
أهم المهام: ${ctx.topTasks.join(", ") || "لا يوجد"}
الامتحانات القادمة: ${ctx.upcomingExams.map((e: any) => `${e.name} (${e.daysLeft} يوم، ${e.progress}%)`).join(", ") || "لا يوجد"}
الرصيد: ${ctx.balance.toLocaleString()} ج.م
الصلوات اليوم: ${ctx.prayedToday}/5

قواعد:
- اربط إجابتك ببيانات المستخدم الفعلية
- لو سأل عن دين → "استشر أهل العلم"
- الرد مختصر ومحفز دائماً`;
}

// ── Chat ─────────────────────────────────────────────────────
export async function chat(uid: string, message: string, history: any[] = []): Promise<string> {
  const ctx = await buildUserContext(uid);
  const systemPrompt = buildSystemPrompt(ctx);

  const historyText = history.slice(-6).map((m: any) =>
    `${m.role === "user" ? "المستخدم" : "الكوتش"}: ${m.text}`
  ).join("\n");

  const fullPrompt = `${systemPrompt}

${historyText ? `المحادثة السابقة:\n${historyText}\n` : ""}
المستخدم: ${message}
الكوتش:`;

  return callGemini(fullPrompt, { temperature: 0.8, maxTokens: 512 });
}

// ── Plan Day ─────────────────────────────────────────────────
export async function planDay(uid: string): Promise<any> {
  const ctx = await buildUserContext(uid);

  const prompt = `أنت مخطط يوم ذكي. بناءً على بيانات المستخدم، اعمل خطة يوم مثالية.

المستخدم: ${ctx.name}
المهام العاجلة: ${ctx.topTasks.join(", ") || "لا يوجد"}
الامتحانات القادمة: ${ctx.upcomingExams.map((e: any) => `${e.name} (${e.daysLeft} يوم)`).join(", ") || "لا يوجد"}
الصلوات اليوم: ${ctx.prayedToday}/5

أرجع JSON فقط بهذا الشكل:
{
  "morning": [{"time": "08:00", "task": "...", "type": "study|work|health|worship"}],
  "afternoon": [{"time": "13:00", "task": "...", "type": "study|work|health|worship"}],
  "evening": [{"time": "19:00", "task": "...", "type": "study|work|health|worship"}],
  "studyPriority": "اسم المادة الأهم",
  "focusTip": "نصيحة تركيز",
  "motivationalNote": "رسالة تحفيزية بالعربية"
}`;

  const result = await callGemini(prompt, { temperature: 0.5, jsonMode: true });
  try {
    return JSON.parse(result);
  } catch {
    return { error: "Failed to generate plan", raw: result };
  }
}

// ── Weekly Review ────────────────────────────────────────────
export async function weeklyReview(uid: string): Promise<any> {
  const ctx = await buildUserContext(uid);

  const prompt = `حلل أسبوع المستخدم وقدم مراجعة شاملة.

المستخدم: ${ctx.name}
المهام المفتوحة: ${ctx.pendingTasks}
الصلوات اليوم: ${ctx.prayedToday}/5
الرصيد: ${ctx.balance.toLocaleString()} ج.م

أرجع JSON فقط:
{
  "weeklyScore": 75,
  "topAchievement": "...",
  "biggestChallenge": "...",
  "nextWeekRecommendations": ["...", "...", "..."],
  "encouragement": "رسالة تحفيزية بالعربية"
}`;

  const result = await callGemini(prompt, { temperature: 0.6, jsonMode: true });
  try {
    return JSON.parse(result);
  } catch {
    return { error: "Failed to generate review" };
  }
}
