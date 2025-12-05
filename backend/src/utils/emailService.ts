import nodemailer from "nodemailer";

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = this.checkConfiguration();

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT!),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        // Add timeout and connection settings
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000, // 5 seconds
        socketTimeout: 15000, // 15 seconds
      });
    } else {
      console.warn(
        "Email service not configured. OTP will be logged to console instead."
      );
    }
  }

  private checkConfiguration(): boolean {
    return !!(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
    );
  }

  async sendOTP(email: string, otp: string): Promise<boolean> {
    // If email service is not configured, log OTP to console for development
    if (!this.isConfigured || !this.transporter) {
      console.log("\n=== EMAIL SERVICE NOT CONFIGURED ===");
      console.log(`📧 Email: ${email}`);
      console.log(`🔐 OTP: ${otp}`);
      console.log(
        `⏰ Expires in: ${process.env.OTP_EXPIRY_MINUTES || 10} minutes`
      );
      console.log("=====================================\n");
      return true; // Return true for development purposes
    }

    try {
      const mailOptions = {
        from: `"WhatsApp Clone" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP for WhatsApp Clone",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #25D366; margin: 0;">WhatsApp Clone</h1>
                <h2 style="color: #333; margin: 10px 0;">Verification Code</h2>
              </div>
              
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                Hello,
              </p>
              
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                Your verification code for WhatsApp Clone is:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; background-color: #25D366; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </span>
              </div>
              
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                This code will expire in ${
                  process.env.OTP_EXPIRY_MINUTES || 10
                } minutes.
              </p>
              
              <p style="color: #999; font-size: 14px; line-height: 1.5;">
                If you didn't request this code, please ignore this email. For security reasons, never share this code with anyone.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `Your WhatsApp Clone verification code is: ${otp}. This code will expire in ${
          process.env.OTP_EXPIRY_MINUTES || 10
        } minutes.`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`OTP email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log(
        "Email service not configured - using console logging for OTPs"
      );
      return true;
    }

    try {
      await this.transporter.verify();
      console.log("Email service is ready");
      return true;
    } catch (error) {
      console.warn(
        "Email service connection failed - falling back to console logging"
      );
      console.warn("Error details:", error);
      // Don't return false - just continue with console logging
      this.transporter = null;
      return true;
    }
  }
}

export default new EmailService();
