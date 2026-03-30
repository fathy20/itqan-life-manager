import { UserContext } from "../context/user-context.builder";

export function buildStudyStrategyPrompt(ctx: UserContext): string {
  const today = new Date().toISOString().split("T")[0];
  return `أنت خبير استراتيجيات دراسة. حلل وضع المستخدم وقدم خطة مذاكرة مخصصة.

المواد:
${ctx.subjects.map(s => {
  const daysLeft = Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000);
  const remaining = s.totalLectures - s.completedLectures;
  const dailyLoad = daysLeft > 0 ? (remaining / daysLeft).toFixed(1) : "∞";
  return `- ${s.name}: ${daysLeft} يوم | ${remaining} محاضرة متبقية | ${dailyLoad} محاضرة/يوم | صعوبة: ${s.difficulty}`;
}).join("\n")}

معدل النوم: ${ctx.lifestyle.avgSleepHours} ساعة
جلسات التركيز: ${ctx.computed.focusSessionsThisWeek}/أسبوع

أرجع JSON فقط:
{
  "subjects": [
    {
      "name": "اسم المادة",
      "riskLevel": "safe|warning|danger",
      "dailyLecturesNeeded": 2,
      "strategy": "استراتيجية مخصصة",
      "bestStudyTime": "الصباح|الظهر|المساء|الليل",
      "tips": ["نصيحة 1", "نصيحة 2"]
    }
  ],
  "overallAdvice": "نصيحة عامة بالعربية"
}`;
}
