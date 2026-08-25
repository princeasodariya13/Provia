import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(), // Optional for now until fully setup
  SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters"),
  
  // Integrations
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().url(),
  
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CALLBACK_URL: z.string().url(),
  
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  
  INTEGRATION_TOKEN_ENCRYPTION_KEY: z.string().optional(),

  // EMAIL
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(1).optional(), // Accepts "Name <email@example.com>" format

  // CLOUDINARY
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // SENTRY
  SENTRY_DSN: z.string().url().optional(),

  // UPSTASH REDIS
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // BACKGROUND JOBS
  JOB_POLL_INTERVAL_MS: z.string().optional().default("3000"),
  JOB_PROCESSING_TIMEOUT_MS: z.string().optional().default("300000"),

  // AI
  GEMINI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  
  // CRON
  CRON_SECRET: z.string().min(16).optional(),

  // RATE LIMITING
  AUTH_RATE_LIMIT_WINDOW_SECONDS: z.string().optional().default("900"), // 15 minutes by default

  AUTH_LOGIN_IP_LIMIT: z.string().optional().default("10"),
  AUTH_LOGIN_ACCOUNT_LIMIT: z.string().optional().default("5"),

  AUTH_REGISTER_IP_LIMIT: z.string().optional().default("3"),

  AUTH_FORGOT_PASSWORD_IP_LIMIT: z.string().optional().default("5"),
  AUTH_FORGOT_PASSWORD_ACCOUNT_LIMIT: z.string().optional().default("3"),

  AUTH_RESEND_VERIFICATION_IP_LIMIT: z.string().optional().default("5"),
  AUTH_RESEND_VERIFICATION_ACCOUNT_LIMIT: z.string().optional().default("3"),

  AUTH_VERIFY_EMAIL_IP_LIMIT: z.string().optional().default("10"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET || "default_development_secret_that_is_long_enough_32",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/integrations/callback?provider=github`,
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  LINKEDIN_CALLBACK_URL: process.env.LINKEDIN_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/integrations/callback?provider=linkedin`,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/v1/auth/google/callback`,
  INTEGRATION_TOKEN_ENCRYPTION_KEY: process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY || "default_integration_secret_key32",
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@provia.app",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY?.trim(),
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET?.trim(),
  SENTRY_DSN: process.env.SENTRY_DSN?.trim(),
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL?.trim(),
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  JOB_POLL_INTERVAL_MS: process.env.JOB_POLL_INTERVAL_MS?.trim(),
  JOB_PROCESSING_TIMEOUT_MS: process.env.JOB_PROCESSING_TIMEOUT_MS?.trim(),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim(),
  AI_MODEL: process.env.AI_MODEL?.trim() || "gemini-2.5-flash",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  CRON_SECRET: process.env.CRON_SECRET,
  AUTH_RATE_LIMIT_WINDOW_SECONDS: process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS,
  AUTH_LOGIN_IP_LIMIT: process.env.AUTH_LOGIN_IP_LIMIT,
  AUTH_LOGIN_ACCOUNT_LIMIT: process.env.AUTH_LOGIN_ACCOUNT_LIMIT,
  AUTH_REGISTER_IP_LIMIT: process.env.AUTH_REGISTER_IP_LIMIT,
  AUTH_FORGOT_PASSWORD_IP_LIMIT: process.env.AUTH_FORGOT_PASSWORD_IP_LIMIT,
  AUTH_FORGOT_PASSWORD_ACCOUNT_LIMIT: process.env.AUTH_FORGOT_PASSWORD_ACCOUNT_LIMIT,
  AUTH_RESEND_VERIFICATION_IP_LIMIT: process.env.AUTH_RESEND_VERIFICATION_IP_LIMIT,
  AUTH_RESEND_VERIFICATION_ACCOUNT_LIMIT: process.env.AUTH_RESEND_VERIFICATION_ACCOUNT_LIMIT,
  AUTH_VERIFY_EMAIL_IP_LIMIT: process.env.AUTH_VERIFY_EMAIL_IP_LIMIT,
});
