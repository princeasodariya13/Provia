import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import { clearSession } from "@/lib/auth";
import { env } from "@/lib/env";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { APIError } from "@/lib/errors";

import { RateLimiterService } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { AnalyticsService } from "@/lib/analytics/service";

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export const POST = withAPIHandler(async (request: Request) => {
  const ip = getClientIp(request);
  const windowSecs = parseInt(env.AUTH_RATE_LIMIT_WINDOW_SECONDS || "900");
  
  // Rate Limit: 5 per 15 mins to prevent brute forcing token verification
  const ipResult = await RateLimiterService.check(
    `auth:reset-password:ip:${ip}`,
    5,
    windowSecs
  );
  if (!ipResult.allowed) {
    AnalyticsService.record({ eventName: "auth.rate_limited", metadata: { endpoint: "reset-password", keyType: "ip" } });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  const body = await request.json();
  const { token, newPassword } = resetPasswordSchema.parse(body);

  try {
    // First, we need to extract the userId without verifying to lookup the user's current password hash.
    // The standard way is to decode the JWT payload first. Since we are using jose, we can just 
    // parse the payload if we have a custom decoder, or we can use an internal function.
    // Actually, jose allows parsing without verification via decodeJwt.
    const { decodeJwt } = await import("jose");
    const unverifiedPayload = decodeJwt(token);
    
    if (!unverifiedPayload || !unverifiedPayload.userId || typeof unverifiedPayload.userId !== "string") {
      throw new APIError("Invalid token format", 400);
    }

    const userId = unverifiedPayload.userId;
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new APIError("Invalid or expired token", 400);
    }

    // Verify token strictly using the dynamic secret
    const secretBase = env.SESSION_SECRET + (user.passwordHash || "");
    const SECRET_KEY = new TextEncoder().encode(secretBase);

    await jwtVerify(token, SECRET_KEY, { algorithms: ["HS256"] });

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: { 
        passwordHash: newPasswordHash,
        sessionVersion: { increment: 1 }
      },
    });

    await clearSession();

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset.",
    });
  } catch {
    // Catch token verification errors (expired, signature mismatch due to changed password)
    throw new APIError("Invalid or expired token", 400);
  }
});
