import { ProviderSyncPayloadSchema } from "../schemas";
import { JobEntity } from "../types";
import { prisma } from "@/lib/db";
import { githubConnector } from "@/lib/integrations/github";
import { linkedinConnector } from "@/lib/integrations/linkedin";
import { SourceConnector } from "@/lib/integrations/connector";
import { decryptToken } from "@/lib/integrations/crypto";
import { normalizeProfileData } from "@/lib/integrations/normalize";
import { Provider } from "@prisma/client";
import { AnalyticsService } from "@/lib/analytics/service";
import { logger } from "@/lib/logger";

export const ProviderSyncHandler = {
  type: "PROVIDER_SYNC" as const,
  schema: ProviderSyncPayloadSchema,
  handler: async (job: JobEntity<{ userId: string; provider: "GITHUB" | "LINKEDIN" }>) => {
    const { userId, provider } = job.payload;
    const providerEnum = provider as Provider;

    const connection = await prisma.connection.findUnique({
      where: { userId_provider: { userId, provider: providerEnum } }
    });

    if (!connection) {
      throw new Error(`Connection not found for user ${userId} and provider ${provider}`);
    }

    if (!connection.accessToken) {
      throw new Error(`Access token missing for connection ${connection.id}`);
    }

    let connector: SourceConnector;
    if (providerEnum === "GITHUB") {
      connector = githubConnector;
    } else if (providerEnum === "LINKEDIN") {
      connector = linkedinConnector;
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!connector.isConfigured()) {
      throw new Error(`Provider ${provider} is not configured`);
    }

    const accessToken = decryptToken(connection.accessToken);

    try {
      const profile = await connector.fetchProfile(accessToken);

      await prisma.rawSourceSnapshot.create({
        data: {
          connectionId: connection.id,
          data: JSON.stringify(profile.rawData),
        }
      });

      const normalized = normalizeProfileData(providerEnum, profile.rawData as Record<string, unknown>);

      const existingProfile = await prisma.professionalProfile.findUnique({
        where: { userId }
      });

      let userEdits: Record<string, boolean> = {};
      if (existingProfile?.userEdits) {
        try { userEdits = JSON.parse(existingProfile.userEdits); } catch (err) {
          logger.warn({ err }, "Failed to parse userEdits in provider sync");
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safeUpdateData: Record<string, any> = {};
      for (const [key, val] of Object.entries(normalized)) {
        if (!userEdits[key]) {
          safeUpdateData[key] = val;
        }
      }

      if (existingProfile) {
        await prisma.professionalProfile.update({
          where: { id: existingProfile.id },
          data: safeUpdateData,
        });
      } else {
        await prisma.professionalProfile.create({
          data: {
            userId,
            ...normalized,
          }
        });
      }

      await prisma.connection.update({
        where: { id: connection.id },
        data: { state: "SYNCED", lastSyncAt: new Date(), externalId: profile.externalId }
      });

      AnalyticsService.record({
        eventName: "integration.import_succeeded",
        userId,
        metadata: { provider: providerEnum }
      });

      return {
        status: "SYNCED",
        externalId: profile.externalId,
      };

    } catch (error) {
      await prisma.connection.update({
        where: { id: connection.id },
        data: { state: "FAILED", errorMessage: error instanceof Error ? error.message : "Unknown error" }
      });

      AnalyticsService.record({
        eventName: "integration.import_failed",
        userId,
        metadata: { provider: providerEnum, error: error instanceof Error ? error.message : "Unknown error" }
      });

      throw error;
    }
  }
};
