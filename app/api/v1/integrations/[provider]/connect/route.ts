import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { APIError } from "@/lib/errors";
import { githubConnector } from "@/lib/integrations/github";
import { linkedinConnector } from "@/lib/integrations/linkedin";
import { SourceConnector } from "@/lib/integrations/connector";

export const GET = withAPIHandler(async (req, args: unknown) => {
  await requireAuth();

  const context = args as { params: Promise<{ provider: string }> };
  const { provider: paramProvider } = await context.params;
  const provider = paramProvider.toUpperCase();
  
  const searchParams = new URL(req.url).searchParams;
  const redirectUri = searchParams.get("redirectUri");
  const state = searchParams.get("state") || "default_state";

  if (!redirectUri) {
    throw new APIError("redirectUri is required", 400);
  }

  let connector: SourceConnector;
  if (provider === "GITHUB") {
    connector = githubConnector;
  } else if (provider === "LINKEDIN") {
    connector = linkedinConnector;
  } else {
    throw new APIError("Invalid provider", 400);
  }

  if (!connector.isConfigured()) {
    throw new APIError("Provider is not configured", 501);
  }

  const authUrl = connector.getAuthUrl(redirectUri, state);

  return NextResponse.json({
    success: true,
    data: { authUrl },
  });
});
