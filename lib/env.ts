import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(), // Optional for now until fully setup
  SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters"),
  // Future integrations:
  // GITHUB_CLIENT_ID: z.string().min(1),
  // GITHUB_CLIENT_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET || "default_development_secret_that_is_long_enough_32",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  AI_MODEL: process.env.AI_MODEL || "gemini-2.5-flash",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
