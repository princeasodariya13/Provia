import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { env } from "@/lib/env";
import { APIError } from "@/lib/errors";
import { cookies } from "next/headers";
import { RateLimiterService } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { AnalyticsService } from "@/lib/analytics/service";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const GET = withAPIHandler(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Rate Limiting
  const ip = getClientIp(req);
  const windowSecs = parseInt(env.AUTH_RATE_LIMIT_WINDOW_SECONDS);
  const ipResult = await RateLimiterService.check(
    `auth:google-callback:ip:${ip}`,
    parseInt(env.AUTH_LOGIN_IP_LIMIT),
    windowSecs
  );
  if (!ipResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "google-callback", keyType: "ip" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  if (error) {
    logger.warn({ error }, "Google OAuth error returned");
    return NextResponse.redirect(new URL("/login?error=Google authentication failed", req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=Invalid request from Google", req.url));
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  if (!storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=Invalid OAuth state", req.url));
  }
  
  // Clear the state cookie
  cookieStore.delete("oauth_state");

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    throw new APIError("Google OAuth is not configured", 501);
  }

  try {
    // Exchange token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: env.GOOGLE_CALLBACK_URL,
      }).toString(),
    });

    if (!tokenRes.ok) {
      throw new Error("Failed to exchange token");
    }

    const tokenData = await tokenRes.json();

    // Fetch user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch user info");
    }

    const googleUser = await userRes.json();
    
    if (!googleUser.email) {
      throw new Error("Google account has no email address");
    }

    if (!googleUser.email_verified) {
      return NextResponse.redirect(new URL("/login?error=Your Google email address is not verified", req.url));
    }

    const email = googleUser.email.toLowerCase();

    // Account Linking & User Isolation
    // Google provides verified emails. We find existing user or create a new one.
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // If user exists but is not email verified, we can safely mark it as verified because Google has verified it.
      if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: googleUser.name || null,
          image: googleUser.picture || null,
          emailVerified: new Date(),
          passwordHash: null,
        },
      });
      AnalyticsService.record({ eventName: "auth.registered", userId: user.id, metadata: { provider: "google" } });
    }

    // Session Creation
    await createSession({
      id: user.id,
      role: user.role,
      email: user.email!,
      sessionVersion: user.sessionVersion,
    });

    AnalyticsService.record({ eventName: "auth.login_succeeded", userId: user.id, metadata: { provider: "google" } });

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url));

  } catch (err) {
    logger.error({ err }, "Google OAuth flow failed");
    return NextResponse.redirect(new URL("/login?error=Google authentication failed", req.url));
  }
});
