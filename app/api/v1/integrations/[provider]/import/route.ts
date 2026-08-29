import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { APIError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { githubConnector } from "@/lib/integrations/github";
import { linkedinConnector } from "@/lib/integrations/linkedin";
import { normalizeProfileData, NormalizedGitHubData } from "@/lib/integrations/normalize";
import { SourceConnector } from "@/lib/integrations/connector";
import { encryptToken } from "@/lib/integrations/crypto";
import { Provider } from "@prisma/client";
import { z } from "zod";
import { AnalyticsService } from "@/lib/analytics/service";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const importSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const POST = withAPIHandler(async (req, args: unknown) => {
  const user = await requireAuth();

  const context = args as { params: Promise<{ provider: string }> };
  const { provider: paramProvider } = await context.params;
  const providerEnum = paramProvider.toUpperCase() as Provider;

  let connector: SourceConnector;
  let canonicalRedirectUri: string;
  if (providerEnum === "GITHUB") {
    connector = githubConnector;
    canonicalRedirectUri = env.GITHUB_CALLBACK_URL;
  } else if (providerEnum === "LINKEDIN") {
    connector = linkedinConnector;
    canonicalRedirectUri = env.LINKEDIN_CALLBACK_URL;
  } else throw new APIError("Invalid provider", 400);

  if (!connector.isConfigured()) {
    throw new APIError("Provider is not configured", 501);
  }

  const body = await req.json();
  const data = importSchema.parse(body);

  // 1. Exchange authorization code for tokens
  const tokens = await connector.exchangeToken(data.code, canonicalRedirectUri);

  const encAccess = tokens.accessToken ? encryptToken(tokens.accessToken) : null;
  const encRefresh = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null;

  // 2. Upsert connection record → IMPORTING state
  const connection = await prisma.connection.upsert({
    where: { userId_provider: { userId: user.id, provider: providerEnum } },
    update: {
      state: "IMPORTING",
      accessToken: encAccess,
      refreshToken: encRefresh,
      scopes: tokens.scopes || null,
      errorMessage: null,
    },
    create: {
      userId: user.id,
      provider: providerEnum,
      state: "IMPORTING",
      accessToken: encAccess,
      refreshToken: encRefresh,
      scopes: tokens.scopes || null,
    },
  });

  try {
    // 3. Fetch profile (GitHub: also fetches repositories)
    const profile = await connector.fetchProfile(tokens.accessToken);

    // 4. Persist raw snapshot (server-side only, never exposed publicly)
    await prisma.rawSourceSnapshot.create({
      data: {
        connectionId: connection.id,
        data: JSON.stringify(profile.rawData),
      },
    });

    // 5. Normalize to canonical structure
    const normalized = normalizeProfileData(
      providerEnum,
      profile.rawData as Record<string, unknown>
    );

    // 6. Find or create the canonical professional profile
    const existingProfile = await prisma.professionalProfile.findFirst({
      where: { userId: user.id },
    });

    // Track which scalar fields the user has manually edited — don't overwrite those
    let userEdits: Record<string, boolean> = {};
    if (existingProfile?.userEdits) {
      try {
        userEdits = JSON.parse(existingProfile.userEdits);
      } catch {
        // ignore corrupt JSON
      }
    }

    const allowedFields = new Set([
      "fullName", "headline", "bio", "location", "avatarUrl", 
      "website", "currentCompany", "jobTitle", "githubUsername", 
      "languages"
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeScalarUpdate: Record<string, any> = {};
    for (const [key, val] of Object.entries(normalized)) {
      // Non-scalar enrichment fields (arrays, objects) are handled separately below
      if (Array.isArray(val) || (typeof val === "object" && val !== null)) continue;
      
      // Only include fields that exist in the database schema
      if (allowedFields.has(key) && !userEdits[key]) {
        safeScalarUpdate[key] = val;
      }
    }

    let canonicalProfile: { id: string };
    if (existingProfile) {
      canonicalProfile = await prisma.professionalProfile.update({
        where: { id: existingProfile.id },
        data: safeScalarUpdate,
      });
    } else {
      canonicalProfile = await prisma.professionalProfile.create({
        data: {
          userId: user.id,
          ...safeScalarUpdate,
        },
      });
    }

    // 7. GitHub-specific enrichment: repositories → projects, languages/topics → skills
    if (providerEnum === "GITHUB") {
      const githubData = normalized as NormalizedGitHubData;

      // ── Projects ────────────────────────────────────────────────────────────
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

          // Look for a pre-existing record from this exact GitHub repo
          const existing = await prisma.professionalProject.findFirst({
            where: { profileId: canonicalProfile.id, externalId: repo.htmlUrl },
          });

          if (existing) {
            // Only update if the user hasn't manually edited this entry
            if (!existing.isManuallyEdited) {
              await prisma.professionalProject.update({
                where: { id: existing.id },
                data: {
                  description: repo.description,
                  repositoryUrl: repo.htmlUrl,
                  url: repo.homepageUrl || null,
                  technologies,
                },
              });
            }
          } else {
            // Deduplication: skip if the user already has a manual project with the same name
            const nameMatch = await prisma.professionalProject.findFirst({
              where: {
                profileId: canonicalProfile.id,
                name: { equals: repo.name, mode: "insensitive" },
                isManuallyEdited: true,
              },
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
                },
              });
            }
          }
        }
      }

      // ── Skills ──────────────────────────────────────────────────────────────
      if (githubData.derivedSkills && githubData.derivedSkills.length > 0) {
        for (const skillName of githubData.derivedSkills) {
          await prisma.professionalSkill.upsert({
            where: {
              profileId_name: { profileId: canonicalProfile.id, name: skillName },
            },
            update: {}, // never downgrade an existing manual/resume skill
            create: {
              profileId: canonicalProfile.id,
              name: skillName,
              source: "GITHUB",
            },
          });
        }
      }

      logger.info(
        {
          userId: user.id,
          repos: githubData.repositories?.length ?? 0,
          skills: githubData.derivedSkills?.length ?? 0,
        },
        "GitHub import: persisted repositories and derived skills"
      );
    }

    // 8. Mark connection as SYNCED
    await prisma.connection.update({
      where: { id: connection.id },
      data: { state: "SYNCED", lastSyncAt: new Date(), externalId: profile.externalId },
    });

    AnalyticsService.record({
      eventName: "integration.import_succeeded",
      userId: user.id,
      metadata: { provider: providerEnum },
    });

    return NextResponse.json({
      success: true,
      data: { status: "SYNCED" },
    });
  } catch (error) {
    await prisma.connection.update({
      where: { id: connection.id },
      data: {
        state: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    AnalyticsService.record({
      eventName: "integration.import_failed",
      userId: user.id,
      metadata: {
        provider: providerEnum,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
});
