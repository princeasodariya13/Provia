import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Configure nodemailer transport using standard Gmail SMTP or other provider
    // Make sure to add your App Password to .env (SMTP_PASS)
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

    // 1. Email to the Portfolio Owner (Prince)
    const ownerMailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`, 
      replyTo: email,
      to: ownerEmail,
      subject: `New Portfolio Message from ${name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h3>New Contact Message</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>
      `,
    };

    // 2. Acknowledgement Email to the User
    const userMailOptions = {
      from: `"Prince Asodariya" <${process.env.SMTP_USER}>`, 
      to: email,
      subject: 'Thank you for reaching out!',
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2>Thank you for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>This is an automated acknowledgement to confirm I have received your message. I'll review it and get back to you as soon as possible.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <h4>Your Message:</h4>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
          <br/>
          <p>Best regards,<br/>Prince Asodariya</p>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(ownerMailOptions);
    await transporter.sendMail(userMailOptions);

    return NextResponse.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
