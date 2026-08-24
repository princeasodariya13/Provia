import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { resendVerificationSchema } from "@/lib/validations/auth";
import { JobService } from "@/lib/jobs";
import { RateLimiterService } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { env } from "@/lib/env";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";
import * as crypto from "crypto";

export const POST = withAPIHandler(async (request: Request) => {
  const body = await request.json();
  const { email } = resendVerificationSchema.parse(body);

  const ip = getClientIp(request);
  const emailHash = crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
  const windowSecs = parseInt(env.AUTH_RATE_LIMIT_WINDOW_SECONDS);

  // 1. IP Rate Limit
  const ipResult = await RateLimiterService.check(
    `auth:resend-verification:ip:${ip}`,
    parseInt(env.AUTH_RESEND_VERIFICATION_IP_LIMIT),
    windowSecs
  );
  if (!ipResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "resend-verification", keyType: "ip" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  // 2. Account/Email Rate Limit
  const accountResult = await RateLimiterService.check(
    `auth:resend-verification:account:${emailHash}`,
    parseInt(env.AUTH_RESEND_VERIFICATION_ACCOUNT_LIMIT),
    windowSecs
  );
  if (!accountResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "resend-verification", keyType: "account" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Only queue if user exists and is not yet verified
  if (user && !user.emailVerified) {
    await JobService.createJob({
      userId: user.id,
      type: "EMAIL_DELIVERY",
      payload: { userId: user.id, template: "VERIFY_EMAIL" },
      idempotencyKey: `email-verify-${user.id}`,
    });
  }

  // Always return generic response to prevent account enumeration
  return NextResponse.json({
    success: true,
    message: "If your account exists and is not yet verified, a new verification link has been sent.",
  });
});
