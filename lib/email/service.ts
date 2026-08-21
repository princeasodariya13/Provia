import { EmailProvider, EmailMessage, EmailDeliveryResult } from "./types";
import { ResendProvider } from "./providers/resend";
import { getWelcomeEmail, getPasswordResetEmail, getSecurityNotificationEmail, getEmailVerificationEmail } from "./templates";
import { logger } from "@/lib/logger";

class EmailServiceImpl {
  private provider: EmailProvider;

  constructor() {
    this.provider = new ResendProvider();
  }

  async sendEmail(message: EmailMessage): Promise<EmailDeliveryResult> {
    logger.info({ to: message.to, subject: message.subject }, "Sending email");
    return this.provider.sendEmail(message);
  }

  async sendWelcomeEmail(to: string, name: string | null) {
    return this.sendEmail({
      to: { email: to, name: name || undefined },
      subject: "Welcome to Provia",
      html: getWelcomeEmail(name),
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    return this.sendEmail({
      to: { email: to },
      subject: "Reset your Provia password",
      html: getPasswordResetEmail(resetUrl),
    });
  }

  async sendSecurityNotification(to: string, action: string) {
    return this.sendEmail({
      to: { email: to },
      subject: "Provia Security Alert",
      html: getSecurityNotificationEmail(action, new Date().toLocaleString()),
    });
  }

  async sendEmailVerificationEmail(to: string, name: string | null, verifyUrl: string) {
    return this.sendEmail({
      to: { email: to, name: name || undefined },
      subject: "Verify your Provia email address",
      html: getEmailVerificationEmail(name, verifyUrl),
    });
  }
}

export const EmailService = new EmailServiceImpl();
