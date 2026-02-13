import nodemailer from 'nodemailer';

// Configuration Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "smtp.mailtrap.io",
  port: process.env.MAILTRAP_PORT || 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

/**
 * Envoyer un email de vérification avec code OTP
 */
export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const mailOptions = {
      from: process.env.MAILTRAP_FROM || "noreply@nexai.com",
      to: email,
      subject: "Verify Your Email - NexAI",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #0066cc; margin: 0; }
              .content { text-align: center; }
              .code-box { background: #f0f8ff; border: 2px solid #0066cc; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .code { font-size: 32px; font-weight: bold; color: #0066cc; letter-spacing: 5px; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Email Verification</h1>
              </div>
              <div class="content">
                <p>Welcome to <strong>NexAI</strong>!</p>
                <p>Please verify your email address by entering the code below:</p>
                <div class="code-box">
                  <div class="code">${verificationCode}</div>
                </div>
                <p style="color: #666;">This code will expire in 10 minutes.</p>
              </div>
              <div class="footer">
                <p>If you didn't sign up for NexAI, please ignore this email.</p>
                <p>&copy; 2024 NexAI. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.MAILTRAP_FROM || "noreply@nexai.com",
      to: email,
      subject: "Reset Your Password - NexAI",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #ff6b6b; margin: 0; }
              .content { text-align: center; }
              .button { display: inline-block; background: linear-gradient(to right, #0066cc, #0052a3); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; font-weight: bold; }
              .button:hover { background: linear-gradient(to right, #0052a3, #003d7a); }
              .timer { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; text-align: left; border-radius: 4px; }
              .timer strong { color: #ff6b6b; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
              .token { background: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔑 Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to proceed:</p>
                <a href="${resetLink}" class="button">Reset Password</a>
                <p style="color: #666;">Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #0066cc; font-size: 12px;">${resetLink}</p>
                
                <div class="timer">
                  <strong>⏰ This link expires in 30 minutes</strong>
                  <p style="margin: 5px 0 0 0; font-size: 12px;">After 30 minutes, you'll need to request a new password reset.</p>
                </div>

                <p style="margin-top: 30px; color: #999; font-size: 12px;">
                  If you didn't request this, please ignore this email and your password will remain unchanged.
                </p>
              </div>
              <div class="footer">
                <p>&copy; 2024 NexAI. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email de bienvenue
 */
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const mailOptions = {
      from: process.env.MAILTRAP_FROM || "noreply@nexai.com",
      to: email,
      subject: "Welcome to NexAI! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; background: linear-gradient(to right, #0066cc, #6b21a8); color: white; padding: 30px; border-radius: 8px; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { text-align: center; }
              .features { text-align: left; margin: 20px 0; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .features ul { list-style: none; padding: 0; }
              .features li { padding: 8px 0; border-bottom: 1px solid #eee; }
              .features li:last-child { border-bottom: none; }
              .features li::before { content: "✨ "; color: #0066cc; font-weight: bold; }
              .button { display: inline-block; background: linear-gradient(to right, #0066cc, #0052a3); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to NexAI, ${firstName}! 🚀</h1>
              </div>
              <div class="content">
                <p>Your email has been verified successfully!</p>
                <p>You now have access to all our amazing AI tools:</p>
                
                <div class="features">
                  <ul>
                    <li>Generate blog titles and articles</li>
                    <li>Create stunning images with AI</li>
                    <li>Generate videos from text</li>
                    <li>Remove background from images</li>
                    <li>Remove unwanted objects from photos</li>
                  </ul>
                </div>

                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Start Creating Now</a>

                <p style="color: #666; margin-top: 30px;">
                  Need help? Check out our <a href="${process.env.FRONTEND_URL}/faq" style="color: #0066cc;">FAQ</a> or 
                  <a href="${process.env.FRONTEND_URL}/support" style="color: #0066cc;">contact support</a>.
                </p>
              </div>
              <div class="footer">
                <p>&copy; 2024 NexAI. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

export default transporter;
