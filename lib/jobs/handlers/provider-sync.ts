import { ProviderSyncPayloadSchema } from "../schemas";
import { JobEntity } from "../types";
import { prisma } from "@/lib/db";
import { githubConnector } from "@/lib/integrations/github";
import { linkedinConnector } from "@/lib/integrations/linkedin";
import { SourceConnector } from "@/lib/integrations/connector";
import { decryptToken } from "@/lib/integrations/crypto";
import { normalizeProfileData, NormalizedGitHubData } from "@/lib/integrations/normalize";
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

      // Only update scalar fields not manually edited by the user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safeUpdateData: Record<string, any> = {};
      for (const [key, val] of Object.entries(normalized)) {
        // Skip non-scalar fields (arrays, objects) that we handle separately
        if (Array.isArray(val) || (typeof val === "object" && val !== null)) continue;
        
        if (!userEdits[key]) {
          safeUpdateData[key] = val;
        }
      }

      let canonicalProfile: { id: string };
      if (existingProfile) {
        canonicalProfile = await prisma.professionalProfile.update({
          where: { id: existingProfile.id },
          data: safeUpdateData,
        });
      } else {
        canonicalProfile = await prisma.professionalProfile.create({
          data: {
            userId,
            ...safeUpdateData,
          }
        });
      }

      // ─── GitHub-specific: persist repositories as projects ─────────────────
      if (providerEnum === "GITHUB") {
        const githubData = normalized as NormalizedGitHubData;

        // Upsert projects from repositories (skip repos with no name, use externalId = repo.htmlUrl)
        if (githubData.repositories && githubData.repositories.length > 0) {
          for (const repo of githubData.repositories) {
            if (!repo.name || !repo.htmlUrl) continue;

            const technologies = [
              ...(repo.language ? [repo.language] : []),
              ...repo.topics,
            ]
              .filter(Boolean)
              .slice(0, 10)
              .join(", ");

            // Check for an existing project from this repo (by externalId OR matching name+source)
            const existing = await prisma.professionalProject.findFirst({
              where: {
                profileId: canonicalProfile.id,
                externalId: repo.htmlUrl,
              }
            });

            if (existing) {
              // Only update non-manually-edited projects
              if (!existing.isManuallyEdited) {
                await prisma.professionalProject.update({
                  where: { id: existing.id },
                  data: {
                    description: repo.description,
                    repositoryUrl: repo.htmlUrl,
                    url: repo.homepageUrl || repo.htmlUrl,
                    technologies,
                  }
                });
              }
            } else {
              // Check if a manual project with the same name already exists (deduplication)
              const nameMatch = await prisma.professionalProject.findFirst({
                where: {
                  profileId: canonicalProfile.id,
                  name: { equals: repo.name, mode: "insensitive" },
                  isManuallyEdited: true,
                }
              });
              if (!nameMatch) {
                await prisma.professionalProject.create({
                  data: {
                    profileId: canonicalProfile.id,
                    name: repo.name,
                    description: repo.description,
                    repositoryUrl: repo.htmlUrl,
                    url: repo.homepageUrl || null,
                    technologies,
                    source: "GITHUB",
                    externalId: repo.htmlUrl,
                  }
                });
              }
            }
          }
        }

        // Upsert derived skills (languages + topics) — upsert by name so no duplicates
        if (githubData.derivedSkills && githubData.derivedSkills.length > 0) {
          for (const skillName of githubData.derivedSkills) {
            await prisma.professionalSkill.upsert({
              where: { profileId_name: { profileId: canonicalProfile.id, name: skillName } },
              update: {}, // don't overwrite if already present
              create: {
                profileId: canonicalProfile.id,
                name: skillName,
                source: "GITHUB",
              }
            });
          }
        }
      }
      // ─── End GitHub-specific ───────────────────────────────────────────────

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

