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
