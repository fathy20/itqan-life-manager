import { GoogleGenerativeAI } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    _client = new GoogleGenerativeAI(key);
  }
  return _client;
}

interface CallOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  model?: string;
}

export async function callGemini(prompt: string, options: CallOptions = {}): Promise<string> {
  const { temperature = 0.7, maxTokens = 2048, jsonMode = false, model = "gemini-2.0-flash" } = options;

  const attempt = async (): Promise<string> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const client = getClient();
      const genModel = client.getGenerativeModel({
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      });

      const result = await genModel.generateContent(prompt);
      const text = result.response.text();

      if (jsonMode) {
        // Validate JSON
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (!match) throw new Error("Response is not valid JSON");
        JSON.parse(match[0]); // validate
        return match[0];
      }

      return text;
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await attempt();
  } catch (err: any) {
    if (err.name === "AbortError") throw new Error("Gemini timeout");
    // 1 retry
    try {
      await new Promise(r => setTimeout(r, 1000));
      return await attempt();
    } catch (retryErr: any) {
      throw new Error(`Gemini failed: ${retryErr.message}`);
    }
  }
}
