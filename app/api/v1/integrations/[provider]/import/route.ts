import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { APIError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { githubConnector } from "@/lib/integrations/github";
import { linkedinConnector } from "@/lib/integrations/linkedin";
import { normalizeProfileData } from "@/lib/integrations/normalize";
import { SourceConnector } from "@/lib/integrations/connector";
import { Provider } from "@prisma/client";
import { z } from "zod";

const importSchema = z.object({
  code: z.string(),
  redirectUri: z.string(),
});

export const POST = withAPIHandler(async (req, args: unknown) => {
  const user = await requireAuth();
  
  const context = args as { params: Promise<{ provider: string }> };
  const { provider: paramProvider } = await context.params;
  const providerEnum = paramProvider.toUpperCase() as Provider;
  
  let connector: SourceConnector;
  if (providerEnum === "GITHUB") connector = githubConnector;
  else if (providerEnum === "LINKEDIN") connector = linkedinConnector;
  else throw new APIError("Invalid provider", 400);

  if (!connector.isConfigured()) {
    throw new APIError("Provider is not configured", 501);
  }

  const body = await req.json();
  const data = importSchema.parse(body);

  // 1. Get tokens
  const tokens = await connector.exchangeToken(data.code, data.redirectUri);

  // 2. Upsert connection to IMPORTING
  const connection = await prisma.connection.upsert({
    where: { userId_provider: { userId: user.id, provider: providerEnum } },
    update: { 
      state: "IMPORTING", 
      accessToken: tokens.accessToken, 
      refreshToken: tokens.refreshToken || null,
      scopes: tokens.scopes || null,
      errorMessage: null 
    },
    create: { 
      userId: user.id, 
      provider: providerEnum, 
      state: "IMPORTING",
      accessToken: tokens.accessToken, 
      refreshToken: tokens.refreshToken || null,
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
    await prisma.professionalProfile.upsert({
      where: { userId: user.id },
      update: {
        ...normalized,
      },
      create: {
        userId: user.id,
        ...normalized,
      }
    });

    // 7. Update connection to SYNCED
    await prisma.connection.update({
      where: { id: connection.id },
      data: { state: "SYNCED", lastSyncAt: new Date(), externalId: profile.externalId }
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
    throw error;
  }
});
