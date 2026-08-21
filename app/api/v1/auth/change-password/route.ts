import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validations/auth";
import { APIError } from "@/lib/errors";
import bcrypt from "bcryptjs";
import { AnalyticsService } from "@/lib/analytics/service";
import { JobService } from "@/lib/jobs";

export const POST = withAPIHandler(async (request: Request) => {
  const user = await requireAuth();
  const body = await request.json();
  const { currentPassword, newPassword } = changePasswordSchema.parse(body);

  // Fetch full user record for password hash
  const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!fullUser?.passwordHash) {
    throw new APIError("Password change is not available for this account", 400);
  }

  const isValid = await bcrypt.compare(currentPassword, fullUser.passwordHash);
  if (!isValid) {
    throw new APIError("Current password is incorrect", 400);
  }

  if (currentPassword === newPassword) {
    throw new APIError("New password must differ from current password", 400);
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  // Invalidate session so the user must log in again with new password
  await clearSession();

  AnalyticsService.record({ eventName: "auth.password_changed", userId: user.id });

  // Queue a security notification
  await JobService.createJob({
    userId: user.id,
    type: "EMAIL_DELIVERY",
    payload: { userId: user.id, template: "SECURITY_ALERT", action: "Password changed" },
  }).catch(() => { /* Non-blocking: don't fail password change if notification queuing fails */ });

  return NextResponse.json({
    success: true,
    message: "Password updated. Please log in again.",
  });
});
