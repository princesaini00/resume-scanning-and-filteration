// lib/email.ts
import nodemailer from "nodemailer";

// Create a transporter with your SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: Boolean(process.env.EMAIL_SERVER_SECURE), // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

/**
 * Send a password reset email to a user
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  const mailOptions = {
    from: `"Mahindra Rise" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Reset Your Password - Mahindra Rise",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${process.env.NEXT_PUBLIC_APP_URL}/public/images/logo.png" alt="Mahindra Logo" style="max-width: 150px;">
        </div>
        
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          
          <p style="color: #666; line-height: 1.5;">
            You've requested to reset your password for your Mahindra Rise account. 
            Please click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.5;">
            This link will expire in 1 hour. If you didn't request to reset your password, 
            you can safely ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.5;">
            If the button above doesn't work, copy and paste this URL into your web browser:
          </p>
          
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${resetUrl}
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Mahindra Rise. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}