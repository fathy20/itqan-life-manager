import { GoogleGenAI } from "@google/genai";
import { config } from "./env";

let _ai: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  return _ai;
}

export async function generateContent(
  model: "gemini-2.0-flash" | "gemini-1.5-pro",
  contents: any[],
  systemInstruction?: string,
  retries = 2
): Promise<string> {
  const ai = getGemini();
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await Promise.race([
        ai.models.generateContent({ model, contents, config: systemInstruction ? { systemInstruction } : undefined }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Gemini timeout")), 30000)),
      ]) as any;
      return res.text || "";
    } catch (err: any) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw new Error("Gemini failed after retries");
}
