import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteAccountSchema } from "@/lib/validations/auth";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";
import { logger } from "@/lib/logger";

export const DELETE = withAPIHandler(async (request: Request) => {
  const user = await requireAuth();
  const body = await request.json();
  const { confirmEmail } = deleteAccountSchema.parse(body);

  // Require the user to type their email as a double-confirmation
  if (confirmEmail !== user.email.toLowerCase()) {
    throw new APIError("Email confirmation does not match your account email", 400);
  }

  // Verify user still exists in DB (concurrent session safety)
  const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!fullUser) {
    throw new APIError("Account not found", 404);
  }

  logger.info({ userId: user.id }, "auth.account_deletion_initiated");

  // Cascade delete via Prisma relations defined with onDelete: Cascade
  await prisma.user.delete({ where: { id: user.id } });

  // Clear session cookie before returning
  await clearSession();

  AnalyticsService.record({ eventName: "auth.account_deleted" });

  logger.info({ userId: user.id }, "auth.account_deleted");

  return NextResponse.json({
    success: true,
    message: "Your account and all associated data have been permanently deleted.",
  });
});
