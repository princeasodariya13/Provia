import { EmailService } from "@/lib/email";
import { EmailDeliveryPayloadSchema } from "../schemas";
import { JobEntity } from "../types";
import { prisma } from "@/lib/db";
import { SignJWT } from "jose";
import { env } from "@/lib/env";

export const EmailDeliveryHandler = {
  type: "EMAIL_DELIVERY" as const,
  schema: EmailDeliveryPayloadSchema,
  handler: async (job: JobEntity<{ userId: string; template: string; action?: string }>) => {
    // 1. Load user from trusted job.userId
    const user = await prisma.user.findUnique({
      where: { id: job.userId },
      select: { id: true, email: true, name: true, passwordHash: true }
    });

    if (!user) {
      throw new Error(`User not found: ${job.userId}`);
    }

    let result;

    // 2. Dispatch based on template
    switch (job.payload.template) {
      case "WELCOME":
        result = await EmailService.sendWelcomeEmail(user.email, user.name);
        break;

      case "PASSWORD_RESET": {
        // Generate a stateless, single-use JWT for password reset.
        // By signing with the passwordHash, the token automatically invalidates after a successful reset.
        const secretBase = env.SESSION_SECRET + (user.passwordHash || "");
        const SECRET_KEY = new TextEncoder().encode(secretBase);
        
        const token = await new SignJWT({ userId: user.id })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("1h")
          .sign(SECRET_KEY);

        const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
        result = await EmailService.sendPasswordResetEmail(user.email, resetUrl);
        break;
      }

      case "VERIFY_EMAIL": {
        // Stateless JWT for email verification — signed with SESSION_SECRET + user.email
        // so it auto-invalidates if email changes.
        const emailSecretBase = env.SESSION_SECRET + user.email;
        const EMAIL_SECRET_KEY = new TextEncoder().encode(emailSecretBase);
        const verifyToken = await new SignJWT({ userId: user.id })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("24h")
          .sign(EMAIL_SECRET_KEY);
        const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verifyToken}`;
        result = await EmailService.sendEmailVerificationEmail(user.email, user.name, verifyUrl);
        break;
      }

      case "SECURITY_ALERT":
        result = await EmailService.sendSecurityNotification(
          user.email, 
          job.payload.action || "Unknown action"
        );
        break;

      default:
        throw new Error(`Unknown email template: ${job.payload.template}`);
    }

    if (!result.success) {
      throw new Error(`Email delivery failed: ${result.error}`);
    }

    return {
      messageId: result.messageId,
      provider: result.provider,
    };
  }
};
