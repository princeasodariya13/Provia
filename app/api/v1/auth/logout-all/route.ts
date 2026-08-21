import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AnalyticsService } from "@/lib/analytics/service";

export const POST = withAPIHandler(async () => {
  const user = await requireAuth();

  // Atomically increment the sessionVersion for the authenticated user.
  // This instantly invalidates all existing JWTs since their embedded
  // sessionVersion will now be less than the user's current sessionVersion.
  await prisma.user.update({
    where: { id: user.id },
    data: { sessionVersion: { increment: 1 } },
  });

  // Clear the current session cookie
  await clearSession();

  AnalyticsService.record({
    eventName: "auth.sessions_revoked",
    userId: user.id,
  });

  return NextResponse.json({
    success: true,
    message: "Logged out of all devices successfully.",
  });
});
