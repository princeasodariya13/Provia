import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteAccountSchema } from "@/lib/validations/auth";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";
import { logger } from "@/lib/logger";
import { CloudinaryService } from "@/lib/cloudinary/service";

export const DELETE = withAPIHandler(async (request: Request) => {
  const user = await requireAuth();
  const body = await request.json();
  const { confirmEmail } = deleteAccountSchema.parse(body);

  // Require the user to type their email as a double-confirmation
  if (confirmEmail !== user.email.toLowerCase()) {
    throw new APIError("Email confirmation does not match your account email", 400);
  }

  // Verify user still exists in DB (concurrent session safety)
  const fullUser = await prisma.user.findUnique({ 
    where: { id: user.id },
    include: {
      resumes: true,
      profile: true,
    }
  });
  if (!fullUser) {
    throw new APIError("Account not found", 404);
  }

  logger.info({ userId: user.id }, "auth.account_deletion_initiated");

  // Destroy Cloudinary assets before database deletion
  if (CloudinaryService.isConfigured()) {
    for (const resume of fullUser.resumes) {
      try {
        await CloudinaryService.destroyAsset(resume.publicId, "raw");
      } catch (e) {
        logger.error({ err: e, userId: user.id, publicId: resume.publicId }, "Failed to destroy resume asset on deletion");
      }
    }

    if (fullUser.profile?.avatarUrl && fullUser.profile.avatarUrl.includes("cloudinary.com/")) {
      try {
        const matches = fullUser.profile.avatarUrl.match(/upload\/(?:v\d+\/)?(provia\/users\/[^/]+\/avatar\/[^.]+)/);
        if (matches && matches[1]) {
          await CloudinaryService.destroyAsset(matches[1], "image");
        }
      } catch (e) {
        logger.error({ err: e, userId: user.id, avatarUrl: fullUser.profile.avatarUrl }, "Failed to destroy avatar asset on deletion");
      }
    }
  }

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
