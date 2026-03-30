import { UserContext } from "../context/user-context.builder";

export function buildFinanceInsightsPrompt(ctx: UserContext): string {
  return `أنت مستشار مالي ذكي. حلل الوضع المالي وقدم رؤى مفيدة.

الوضع المالي:
- الدخل الشهري: ${ctx.finance.monthlyIncome.toLocaleString()} ج.م
- المصروفات: ${ctx.finance.monthlyExpense.toLocaleString()} ج.م
- الرصيد: ${ctx.finance.balance.toLocaleString()} ج.م
- الالتزامات الشهرية: ${ctx.finance.commitments.toLocaleString()} ج.م
- نسبة الالتزامات: ${ctx.finance.monthlyIncome > 0 ? Math.round(ctx.finance.commitments / ctx.finance.monthlyIncome * 100) : 0}%

أرجع JSON فقط:
{
  "spendingPattern": "وصف نمط الإنفاق",
  "savingsRate": 15,
  "commitmentHealth": "healthy|tight|risky",
  "advice": ["نصيحة 1", "نصيحة 2", "نصيحة 3"],
  "monthlyProjection": 5000,
  "alert": "تحذير مهم إن وجد أو null"
}`;
}
