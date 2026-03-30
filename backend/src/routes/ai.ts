import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { GoogleGenAI } from "@google/genai";
import { db } from "../lib/firebase-admin";

const router = Router();

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Build user context from Firestore
async function buildUserContext(uid: string) {
  const [profileSnap, subjectsSnap, tasksSnap, transSnap] = await Promise.all([
    db.collection("users").doc(uid).get(),
    db.collection("users").doc(uid).collection("subjects").get(),
    db.collection("users").doc(uid).collection("tasks").where("status", "!=", "completed").get(),
    db.collection("users").doc(uid).collection("transactions").orderBy("date", "desc").limit(20).get(),
  ]);

  const profile = profileSnap.data() || {};
  const subjects = subjectsSnap.docs.map(d => d.data());
  const tasks = tasksSnap.docs.map(d => d.data());
  const transactions = transSnap.docs.map(d => d.data());

  const balance = transactions.reduce((acc: number, t: any) =>
    t.type === "income" ? acc + t.amount : acc - t.amount, 0);

  return { profile, subjects, tasks, balance, transactionCount: transactions.length };
}

// POST /api/v1/ai/coach
router.post("/coach", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ctx = await buildUserContext(req.uid!);
    const ai = getAI();

    const systemPrompt = `أنت "المدرب الشخصي الذكي" في تطبيق إتقان لإدارة الحياة.
مهمتك مساعدة المستخدم (${ctx.profile.name || "المستخدم"}) في تنظيم حياته، دراسته، وعمله.

بيانات المستخدم:
- المواد الدراسية: ${ctx.subjects.map((s: any) => `${s.name} (امتحان: ${s.examDate})`).join(", ") || "لا يوجد"}
- المهام المفتوحة: ${ctx.tasks.length} مهمة
- الرصيد المالي: ${ctx.balance.toLocaleString()} ج.م

قواعد:
- تكلم بالعربية دائماً
- كن محفزاً وعملياً ومختصراً
- لا تعطي نصائح طبية أو قانونية
- اربط إجاباتك بأهداف المستخدم الحالية`;

    const contents = [
      ...history.map((m: any) => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] })),
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: { systemInstruction: systemPrompt }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI coach error:", error);
    res.status(500).json({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" });
  }
});

export default router;
