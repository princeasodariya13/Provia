import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIProviderResponse } from "./types";
import { env } from "@/lib/env";
import { APIError } from "@/lib/errors";
import { z } from "zod";

export const geminiProvider: AIProvider = {
  name: "GEMINI",

  isConfigured(): boolean {
    return !!env.GEMINI_API_KEY;
  },

  async generateStructured<T>(prompt: string, schema: z.ZodSchema<T>): Promise<AIProviderResponse<T>> {
    if (!env.GEMINI_API_KEY) {
      throw new APIError("Gemini API key is not configured", 501);
    }

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const modelName = env.AI_MODEL || "gemini-3.6-flash";
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      let parsed;
      try {
        parsed = JSON.parse(text.trim());
      } catch {
        throw new APIError("AI Provider returned invalid JSON", 502);
      }

      const validated = schema.parse(parsed);

      return {
        result: validated,
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
        },
        model: modelName,
        provider: this.name,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError("AI output failed validation", 502);
      }
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`AI Generation failed: ${error instanceof Error ? error.message : "Unknown"}`, 502);
    }
  }
};
