import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { APIError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { githubConnector } from "@/lib/integrations/github";
import { linkedinConnector } from "@/lib/integrations/linkedin";
import { normalizeProfileData } from "@/lib/integrations/normalize";
import { SourceConnector } from "@/lib/integrations/connector";
import { encryptToken } from "@/lib/integrations/crypto";
import { Provider } from "@prisma/client";
import { z } from "zod";
import { AnalyticsService } from "@/lib/analytics/service";
import { env } from "@/lib/env";

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
  }
  else if (providerEnum === "LINKEDIN") {
    connector = linkedinConnector;
    canonicalRedirectUri = env.LINKEDIN_CALLBACK_URL;
  }
  else throw new APIError("Invalid provider", 400);

  if (!connector.isConfigured()) {
    throw new APIError("Provider is not configured", 501);
  }

  const body = await req.json();
  const data = importSchema.parse(body);

  // 1. Get tokens
  const tokens = await connector.exchangeToken(data.code, canonicalRedirectUri);

  const encAccess = tokens.accessToken ? encryptToken(tokens.accessToken) : null;
  const encRefresh = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null;

  // 2. Upsert connection to IMPORTING
  const connection = await prisma.connection.upsert({
    where: { userId_provider: { userId: user.id, provider: providerEnum } },
    update: { 
      state: "IMPORTING", 
      accessToken: encAccess, 
      refreshToken: encRefresh,
      scopes: tokens.scopes || null,
      errorMessage: null 
    },
    create: { 
      userId: user.id, 
      provider: providerEnum, 
      state: "IMPORTING",
      accessToken: encAccess, 
      refreshToken: encRefresh,
      scopes: tokens.scopes || null,
    }
  });

  try {
    // 3. Fetch profile
    const profile = await connector.fetchProfile(tokens.accessToken);

    // 4. Save Raw Snapshot
    await prisma.rawSourceSnapshot.create({
      data: {
        connectionId: connection.id,
        data: JSON.stringify(profile.rawData),
      }
    });

    // 5. Normalize
    const normalized = normalizeProfileData(providerEnum, profile.rawData as Record<string, unknown>);

    // 6. Save Canonical Profile
    const existingProfile = await prisma.professionalProfile.findUnique({
      where: { userId: user.id }
    });

    let userEdits: Record<string, boolean> = {};
    if (existingProfile?.userEdits) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      try { userEdits = JSON.parse(existingProfile.userEdits); } catch (err) {}
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
          userId: user.id,
          ...normalized,
        }
      });
    }

    // 7. Update connection to SYNCED
    await prisma.connection.update({
      where: { id: connection.id },
      data: { state: "SYNCED", lastSyncAt: new Date(), externalId: profile.externalId }
    });

    AnalyticsService.record({
      eventName: "integration.import_succeeded",
      userId: user.id,
      metadata: { provider: providerEnum }
    });

    return NextResponse.json({
      success: true,
      data: { status: "SYNCED" }
    });

  } catch (error) {
    // Revert state to FAILED
    await prisma.connection.update({
      where: { id: connection.id },
      data: { state: "FAILED", errorMessage: error instanceof Error ? error.message : "Unknown error" }
    });

    AnalyticsService.record({
      eventName: "integration.import_failed",
      userId: user.id,
      metadata: { provider: providerEnum, error: error instanceof Error ? error.message : "Unknown error" }
    });

    throw error;
  }
});
