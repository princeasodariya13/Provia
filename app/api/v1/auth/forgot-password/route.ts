import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { JobService } from "@/lib/jobs";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const POST = withAPIHandler(async (request: Request) => {
  const body = await request.json();
  const { email } = forgotPasswordSchema.parse(body);

  // We look up the user, but we MUST NOT reveal whether the user exists in the response
  // to prevent account enumeration.
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (user) {
    // Queue the email delivery job asynchronously.
    // Idempotency: user can only have one password reset job queued at a time
    await JobService.createJob({
      userId: user.id,
      type: "EMAIL_DELIVERY",
      payload: { userId: user.id, template: "PASSWORD_RESET" },
      idempotencyKey: `email-reset-${user.id}`,
    });
  }

  // Generic response to prevent enumeration
  return NextResponse.json({
    success: true,
    message: "If an account with that email exists, we have sent a password reset link.",
  });
});
