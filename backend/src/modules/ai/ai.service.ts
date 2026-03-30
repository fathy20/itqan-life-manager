import { buildUserContext } from "./context/user-context.builder";
import { buildCoachPrompt } from "./prompts/coach-chat.prompt";
import { buildPlanDayPrompt } from "./prompts/plan-day.prompt";
import { buildStudyStrategyPrompt } from "./prompts/study-strategy.prompt";
import { buildFinanceInsightsPrompt } from "./prompts/finance-insights.prompt";
import { generateContent } from "../../config/gemini";
import { db } from "../../lib/firebase-admin";

function parseJSON(text: string): any {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  } catch {
    return null;
  }
}

async function logAIRequest(uid: string, endpoint: string, success: boolean, durationMs: number) {
  await db.collection("users").doc(uid).collection("ai_requests").add({
    endpoint, success, durationMs, createdAt: new Date().toISOString()
  }).catch(() => {});
}

export async function coachChat(uid: string, message: string, history: any[] = []): Promise<string> {
  const start = Date.now();
  const ctx = await buildUserContext(uid);
  const systemPrompt = buildCoachPrompt(ctx);
  const contents = [
    ...history.slice(-10).map((m: any) => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: message }] }
  ];
  const result = await generateContent("gemini-2.0-flash", contents, systemPrompt);
  await logAIRequest(uid, "coach", true, Date.now() - start);
  return result;
}

export async function planDay(uid: string): Promise<any> {
  const start = Date.now();
  const ctx = await buildUserContext(uid);
  const today = new Date().toISOString().split("T")[0];
  const prompt = buildPlanDayPrompt(ctx, today);
  const result = await generateContent("gemini-2.0-flash", [{ role: "user", parts: [{ text: prompt }] }]);
  const parsed = parseJSON(result);
  await logAIRequest(uid, "plan-day", !!parsed, Date.now() - start);
  return parsed || { error: "Failed to generate plan" };
}

export async function studyStrategy(uid: string): Promise<any> {
  const start = Date.now();
  const ctx = await buildUserContext(uid);
  const prompt = buildStudyStrategyPrompt(ctx);
  const result = await generateContent("gemini-1.5-pro" as any, [{ role: "user", parts: [{ text: prompt }] }]);
  const parsed = parseJSON(result);
  await logAIRequest(uid, "study-strategy", !!parsed, Date.now() - start);
  return parsed || { error: "Failed to generate strategy" };
}

export async function financeInsights(uid: string): Promise<any> {
  const start = Date.now();
  const ctx = await buildUserContext(uid);
  const prompt = buildFinanceInsightsPrompt(ctx);
  const result = await generateContent("gemini-1.5-pro" as any, [{ role: "user", parts: [{ text: prompt }] }]);
  const parsed = parseJSON(result);
  await logAIRequest(uid, "finance-insights", !!parsed, Date.now() - start);
  return parsed || { error: "Failed to generate insights" };
}
