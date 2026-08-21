import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(), // Optional for now until fully setup
  SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters"),
  
  // Integrations
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().url().optional(),
  
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CALLBACK_URL: z.string().url().optional(),
  
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  INTEGRATION_TOKEN_ENCRYPTION_KEY: z.string().optional(),

  // EMAIL
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // CLOUDINARY
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // AI
  GEMINI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET || "default_development_secret_that_is_long_enough_32",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  LINKEDIN_CALLBACK_URL: process.env.LINKEDIN_CALLBACK_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  INTEGRATION_TOKEN_ENCRYPTION_KEY: process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@provia.app",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  AI_MODEL: process.env.AI_MODEL || "gemini-2.5-flash",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
