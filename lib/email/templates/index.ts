export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const baseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; line-height: 1.5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #111827; }
    .content { font-size: 16px; color: #374151; margin-bottom: 24px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; }
    .footer { font-size: 14px; color: #6b7280; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Provia</div>
    <div class="content">${content}</div>
    <div class="footer">&copy; ${new Date().getFullYear()} Provia. All rights reserved.</div>
  </div>
</body>
</html>
`;

export const getWelcomeEmail = (name: string | null) => {
  const safeName = name ? escapeHtml(name) : "there";
  const content = `
    <p>Hi ${safeName},</p>
    <p>Welcome to Provia! We're excited to have you on board. You can now build and manage your professional portfolio effortlessly.</p>
    <p>If you have any questions, feel free to reply to this email.</p>
  `;
  return baseTemplate("Welcome to Provia", content);
};

export const getPasswordResetEmail = (resetUrl: string) => {
  const content = `
    <p>We received a request to reset your password for your Provia account.</p>
    <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(resetUrl)}" class="button">Reset Password</a>
    </p>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
  `;
  return baseTemplate("Reset your password", content);
};

export const getSecurityNotificationEmail = (action: string, time: string) => {
  const content = `
    <p>We noticed a recent security event on your Provia account:</p>
    <p><strong>Action:</strong> ${escapeHtml(action)}</p>
    <p><strong>Time:</strong> ${escapeHtml(time)}</p>
    <p>If this was you, no further action is required. If you did not perform this action, please secure your account immediately or contact support.</p>
  `;
  return baseTemplate("Security Alert", content);
};

export const getEmailVerificationEmail = (name: string | null, verifyUrl: string) => {
  const safeName = name ? escapeHtml(name) : "there";
  const content = `
    <p>Hi ${safeName},</p>
    <p>Please verify your email address to complete your Provia account setup. Click the button below — this link expires in 24 hours.</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(verifyUrl)}" class="button">Verify Email Address</a>
    </p>
    <p>If you didn't create a Provia account, you can safely ignore this email.</p>
  `;
  return baseTemplate("Verify your email", content);
};
