export type EmailRecipient = {
  email: string;
  name?: string;
};

export type EmailMessage = {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type EmailDeliveryResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
};

export interface EmailProvider {
  sendEmail(message: EmailMessage): Promise<EmailDeliveryResult>;
}
