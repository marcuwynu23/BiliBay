import nodemailer from "nodemailer";

// Email configuration - can be set via environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    console.warn("Email service not configured properly:", error.message);
    console.warn("Password reset emails will not be sent. Please configure EMAIL_USER and EMAIL_PASS environment variables.");
  } else {
    console.log("Email service is ready");
  }
});

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  try {
    // Skip sending if email is not configured
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("Email not configured. Password reset token:", resetToken);
      console.warn(`Reset link: ${FRONTEND_URL}/reset-password?token=${resetToken}`);
      return;
    }

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"BiliBay" <${EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - BiliBay",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #98b964, #5e7142); height: 4px; border-radius: 4px 4px 0 0;"></div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #98b964; margin-top: 0;">Reset Your Password</h1>
            <p>Hello,</p>
            <p>We received a request to reset your password for your BiliBay account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #98b964; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; transition: background-color 0.3s;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; background: #f5f5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} BiliBay. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Password - BiliBay
        
        Hello,
        
        We received a request to reset your password for your BiliBay account.
        
        Click this link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        
        © ${new Date().getFullYear()} BiliBay. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error: any) {
    console.error("Error sending password reset email:", error.message);
    // Don't throw error - we don't want to break the flow if email fails
    // The token is still generated and saved, user can request again if needed
  }
};

