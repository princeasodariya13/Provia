import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";
import { JobService } from "@/lib/jobs";
import { RateLimiterService } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { env } from "@/lib/env";

export const POST = withAPIHandler(async (req) => {
  const body = await req.json();
  const data = registerSchema.parse(body);

  const ip = getClientIp(req);
  const windowSecs = parseInt(env.AUTH_RATE_LIMIT_WINDOW_SECONDS);

  // 1. IP Rate Limit (prevent mass account creation)
  const ipResult = await RateLimiterService.check(
    `auth:register:ip:${ip}`,
    parseInt(env.AUTH_REGISTER_IP_LIMIT),
    windowSecs
  );
  if (!ipResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "register", keyType: "ip" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    const isValid = await bcrypt.compare(data.password, existingUser.passwordHash);
    if (!isValid) {
      throw new APIError("An account with this email already exists. Incorrect password.", 401);
    }
    
    // Direct login for returning users who use the register form
    await createSession(existingUser);
    
    AnalyticsService.record({
      eventName: "auth.login_via_register",
      userId: existingUser.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
    select: { id: true, name: true, email: true, role: true, sessionVersion: true, createdAt: true, updatedAt: true },
  });

  // Direct login! Permanently store session for this device
  await createSession(user);

  // Queue email verification (non-blocking — registration succeeds regardless)
  JobService.createJob({
    userId: user.id,
    type: "EMAIL_DELIVERY",
    payload: { userId: user.id, template: "VERIFY_EMAIL" },
    idempotencyKey: `email-verify-${user.id}`,
  }).catch(() => { /* Non-blocking */ });

  AnalyticsService.record({
    eventName: "auth.registered",
    userId: user.id,
  });

  return NextResponse.json({
    success: true,
    data: user,
  });
});
