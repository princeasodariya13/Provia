import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { JobService } from "@/lib/jobs";
import { z } from "zod";
import { RateLimiterService } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { env } from "@/lib/env";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const POST = withAPIHandler(async (request: Request) => {
  const body = await request.json();
  const { email } = forgotPasswordSchema.parse(body);

  const ip = getClientIp(request);
  const emailHash = crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
  const windowSecs = parseInt(env.AUTH_RATE_LIMIT_WINDOW_SECONDS);

  // 1. IP Rate Limit
  const ipResult = await RateLimiterService.check(
    `auth:forgot-password:ip:${ip}`,
    parseInt(env.AUTH_FORGOT_PASSWORD_IP_LIMIT),
    windowSecs
  );
  if (!ipResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "forgot-password", keyType: "ip" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  // 2. Account/Email Rate Limit
  const accountResult = await RateLimiterService.check(
    `auth:forgot-password:account:${emailHash}`,
    parseInt(env.AUTH_FORGOT_PASSWORD_ACCOUNT_LIMIT),
    windowSecs
  );
  if (!accountResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "forgot-password", keyType: "account" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  // We look up the user, but we MUST NOT reveal whether the user exists in the response
  // to prevent account enumeration.
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (user) {
    // Queue the email delivery job asynchronously.
    // Idempotency: user can only have one password reset job queued at a time
    await JobService.createJob({
      userId: user.id,
      type: "EMAIL_DELIVERY",
      payload: { userId: user.id, template: "PASSWORD_RESET" },
      idempotencyKey: `email-reset-${user.id}`,
    });
  }

  // Generic response to prevent enumeration
  return NextResponse.json({
    success: true,
    message: "If an account with that email exists, we have sent a password reset link.",
  });
});
