import { z } from "zod";

export const ProfileAnalysisPayloadSchema = z.object({
  userId: z.string(),
});

export const PortfolioGenerationPayloadSchema = z.object({
  userId: z.string(),
});

export const ProviderSyncPayloadSchema = z.object({
  userId: z.string(),
  provider: z.enum(["GITHUB", "LINKEDIN"]),
});

export const EmailDeliveryPayloadSchema = z.object({
  userId: z.string(),
  template: z.enum(["WELCOME", "PASSWORD_RESET", "SECURITY_ALERT"]),
  action: z.string().optional(), // For security alerts
});
