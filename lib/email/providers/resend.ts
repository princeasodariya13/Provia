import { Resend } from "resend";
import { env } from "@/lib/env";
import { EmailProvider, EmailMessage, EmailDeliveryResult } from "../types";
import { logger } from "@/lib/logger";

export class ResendProvider implements EmailProvider {
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor() {
    // Resend free tier strictly requires sending from onboarding@resend.dev
    this.fromEmail = env.EMAIL_FROM || "onboarding@resend.dev";
    
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
    } else {
      logger.warn("RESEND_API_KEY is not configured. Email delivery will fail safely.");
    }
  }

  async sendEmail(message: EmailMessage): Promise<EmailDeliveryResult> {
    if (!this.resend) {
      return {
        success: false,
        error: "Email provider is not configured (missing RESEND_API_KEY)",
        provider: "resend",
      };
    }

    try {
      const to = Array.isArray(message.to)
        ? message.to.map((t) => t.email)
        : [message.to.email];

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
      });

      if (error) {
        logger.error({ err: error }, "Resend API error during email delivery");
        return {
          success: false,
          error: error.message,
          provider: "resend",
        };
      }

      return {
        success: true,
        messageId: data?.id,
        provider: "resend",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      logger.error({ err }, "Exception during Resend API call");
      return {
        success: false,
        error: msg,
        provider: "resend",
      };
    }
  }
}
