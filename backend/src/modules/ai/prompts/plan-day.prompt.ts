import { UserContext } from "../context/user-context.builder";

export function buildPlanDayPrompt(ctx: UserContext, today: string): string {
  return `أنت مخطط يوم ذكي. بناءً على بيانات المستخدم، اعمل خطة يوم مثالية.

المستخدم: ${ctx.profile.name} | ${ctx.profile.role}
اليوم: ${today}

المواد الأقرب امتحاناً:
${ctx.subjects.filter(s => s.examDate >= today).slice(0, 3).map(s => `- ${s.name}: ${s.examDate} (${s.completedLectures}/${s.totalLectures} محاضرة)`).join("\n") || "لا يوجد"}

المهام العاجلة:
${ctx.tasks.filter(t => t.priority === "high").slice(0, 5).map(t => `- ${t.title} (${t.type})`).join("\n") || "لا يوجد"}

معدل النوم: ${ctx.lifestyle.avgSleepHours} ساعة
جلسات التركيز هذا الأسبوع: ${ctx.computed.focusSessionsThisWeek}

أرجع JSON فقط بهذا الشكل بالضبط:
{
  "morningBlock": [{"time": "08:00", "task": "...", "duration": 60, "type": "study|work|health"}],
  "afternoonBlock": [{"time": "13:00", "task": "...", "duration": 90, "type": "study|work|health"}],
  "eveningBlock": [{"time": "19:00", "task": "...", "duration": 60, "type": "study|work|health"}],
  "studyPriority": "اسم المادة الأهم اليوم",
  "focusTip": "نصيحة تركيز قصيرة",
  "motivationalNote": "رسالة تحفيزية بالعربية"
}`;
}
