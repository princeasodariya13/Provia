import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { resendVerificationSchema } from "@/lib/validations/auth";
import { JobService } from "@/lib/jobs";

export const POST = withAPIHandler(async (request: Request) => {
  const body = await request.json();
  const { email } = resendVerificationSchema.parse(body);

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
