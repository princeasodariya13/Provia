import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { jwtVerify, decodeJwt } from "jose";
import { env } from "@/lib/env";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";

export const POST = withAPIHandler(async (request: Request) => {
  const body = await request.json();
  const { token } = verifyEmailSchema.parse(body);

  try {
    const unverifiedPayload = decodeJwt(token);
    if (!unverifiedPayload?.userId || typeof unverifiedPayload.userId !== "string") {
      throw new APIError("Invalid token format", 400);
    }

    const userId = unverifiedPayload.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new APIError("Invalid or expired token", 400);
    }

    // Already verified — idempotent success
    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: "Email already verified." });
    }

    // Verify JWT using secret derived from SESSION_SECRET + user.email
    const secretBase = env.SESSION_SECRET + user.email;
    const SECRET_KEY = new TextEncoder().encode(secretBase);
    await jwtVerify(token, SECRET_KEY, { algorithms: ["HS256"] });

    // Mark verified
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    AnalyticsService.record({ eventName: "auth.email_verified", userId });

    return NextResponse.json({ success: true, message: "Email successfully verified." });
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new APIError("Invalid or expired verification link", 400);
  }
});
