import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { withAPIHandler } from "@/lib/api-handler";
import { RateLimiterService } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const POST = withAPIHandler(async (req: Request) => {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    throw new APIError('Missing required fields', 400);
  }

  const ip = getClientIp(req);
  
  // Rate limit: 5 messages per hour per IP to prevent spam
  const ipResult = await RateLimiterService.check(
    `contact:ip:${ip}`,
    5,
    3600
  );

  if (!ipResult.allowed) {
    AnalyticsService.record({ eventName: "api.request_failed", metadata: { endpoint: "contact", reason: "rate_limited" } });
    throw new APIError("Too many messages sent. Please try again later.", 429);
  }

  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const ownerEmail = 'princeasodariyaofficial13@gmail.com';

  const ownerMailOptions = {
    from: `"${safeName}" <${process.env.SMTP_USER}>`, 
    replyTo: email,
    to: ownerEmail,
    subject: `New Portfolio Message from ${safeName}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
          ${safeMessage}
        </p>
      </div>
    `,
  };

  const userMailOptions = {
    from: `"Prince Asodariya" <${process.env.SMTP_USER}>`, 
    to: email,
    subject: 'Thank you for reaching out!',
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2>Thank you for reaching out!</h2>
        <p>Hi ${safeName},</p>
        <p>This is an automated acknowledgement to confirm I have received your message. I'll review it and get back to you as soon as possible.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <h4>Your Message:</h4>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
          ${safeMessage}
        </p>
        <br/>
        <p>Best regards,<br/>Prince Asodariya</p>
      </div>
    `,
  };

  await transporter.sendMail(ownerMailOptions);
  await transporter.sendMail(userMailOptions);

  return NextResponse.json({ success: true, message: 'Emails sent successfully' });
});
