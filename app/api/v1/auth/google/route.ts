import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { env } from "@/lib/env";
import { APIError } from "@/lib/errors";
import * as crypto from "crypto";
import { cookies } from "next/headers";
import { RateLimiterService } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { AnalyticsService } from "@/lib/analytics/service";

export const GET = withAPIHandler(async (req) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CALLBACK_URL) {
    throw new APIError("Google OAuth is not configured", 501);
  }

  // Rate Limiting
  const ip = getClientIp(req);
  const windowSecs = parseInt(env.AUTH_RATE_LIMIT_WINDOW_SECONDS);
  
  const ipResult = await RateLimiterService.check(
    `auth:google:ip:${ip}`,
    parseInt(env.AUTH_LOGIN_IP_LIMIT),
    windowSecs
  );
  if (!ipResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "google-auth", keyType: "ip" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  const state = crypto.randomBytes(32).toString("hex");
  
  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(authUrl);
});
