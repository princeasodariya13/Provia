import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { UnauthorizedError, APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";
import { RateLimiterService } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { env } from "@/lib/env";
import crypto from "crypto";

export const POST = withAPIHandler(async (req) => {
  const body = await req.json();
  const data = loginSchema.parse(body);

  const ip = getClientIp(req);
  const emailHash = crypto.createHash("sha256").update(data.email.toLowerCase()).digest("hex");
  const windowSecs = parseInt(env.AUTH_RATE_LIMIT_WINDOW_SECONDS);

  // 1. IP Rate Limit
  const ipResult = await RateLimiterService.check(
    `auth:login:ip:${ip}`,
    parseInt(env.AUTH_LOGIN_IP_LIMIT),
    windowSecs
  );
  if (!ipResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "login", keyType: "ip" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  // 2. Account Rate Limit
  const accountResult = await RateLimiterService.check(
    `auth:login:account:${emailHash}`,
    parseInt(env.AUTH_LOGIN_ACCOUNT_LIMIT),
    windowSecs
  );
  if (!accountResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "login", keyType: "account" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !user.passwordHash) {
    AnalyticsService.record({ eventName: "auth.login_failed", metadata: { reason: "user_not_found" } });
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

  if (!isValidPassword) {
    AnalyticsService.record({ eventName: "auth.login_failed", userId: user.id, metadata: { reason: "invalid_password" } });
    throw new UnauthorizedError("Invalid email or password");
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email!,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  await createSession(safeUser);

  AnalyticsService.record({ eventName: "auth.login_succeeded", userId: user.id });

  return NextResponse.json({
    success: true,
    data: safeUser,
  });
});
