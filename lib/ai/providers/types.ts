import { z } from "zod";

export interface AIProviderResponse<T> {
  result: T;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  generateStructured<T>(prompt: string, schema: z.ZodSchema<T>): Promise<AIProviderResponse<T>>;
}
