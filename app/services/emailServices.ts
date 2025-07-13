// services/emailService.ts
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  // Replace with your SMTP settings
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Generate a random 6-digit code
export const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetCode: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"Task Manager" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset. Use the following code to verify your identity:</p>
          <div style="padding: 10px; background-color: #f5f5f5; font-size: 24px; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            <strong>${resetCode}</strong>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};