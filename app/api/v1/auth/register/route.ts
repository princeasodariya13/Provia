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
    if (!existingUser.passwordHash) {
      throw new APIError("An account with this email exists. Please sign in with your connected provider.", 401);
    }
    const isValid = await bcrypt.compare(data.password, existingUser.passwordHash);
    if (!isValid) {
      throw new APIError("An account with this email already exists. Incorrect password.", 401);
    }
    
    // Handle unverified users trying to register again
    if (!existingUser.emailVerified) {
      // Resend the verification email silently
      try {
        const { EmailDeliveryHandler } = await import("@/lib/jobs/handlers/email-delivery");
        await EmailDeliveryHandler.handler({
          id: "sync-register-resend",
          type: "EMAIL_DELIVERY",
          userId: existingUser.id,
          status: "PROCESSING",
          attempts: 1,
          maxAttempts: 1,
          availableAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          payload: { userId: existingUser.id, template: "VERIFY_EMAIL" },
          result: null,
          errorCode: null,
          errorMessage: null,
          startedAt: null,
          completedAt: null,
          failedAt: null,
          idempotencyKey: null,
        });
      } catch (err) {
        console.error("Failed to resend verification on re-register:", err);
      }
      
      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message: "Registration successful. Please check your email to verify your account.",
        data: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        },
      });
    }
    
    // Direct login for returning users who use the register form
    await createSession(existingUser);
    
    AnalyticsService.record({
      eventName: "auth.login_succeeded",
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

  // NOTE: Deliberately skipping createSession(user) here. 
  // The user MUST verify their email before they can sign in.

  // Trigger email verification synchronously so it sends instantly without needing a background worker
  try {
    const { EmailDeliveryHandler } = await import("@/lib/jobs/handlers/email-delivery");
    await EmailDeliveryHandler.handler({
      id: "sync-register",
      type: "EMAIL_DELIVERY",
      userId: user.id,
      status: "PROCESSING",
      attempts: 1,
      maxAttempts: 1,
      availableAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      payload: { userId: user.id, template: "VERIFY_EMAIL" },
      result: null,
      errorCode: null,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      failedAt: null,
      idempotencyKey: null,
    });
  } catch (err) {
    console.error("Failed to send synchronous verification email on register:", err);
  }

  AnalyticsService.record({
    eventName: "auth.registered",
    userId: user.id,
  });

  return NextResponse.json({
    success: true,
    requiresVerification: true,
    message: "Registration successful. Please check your email to verify your account.",
    data: user,
  });
});
