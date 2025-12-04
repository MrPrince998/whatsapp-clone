import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/users";
import emailService from "../utils/emailService";

class AuthController {
  // Generate OTP API
  async generateOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Validate email
      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
        return;
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Calculate OTP expiry time (default 10 minutes)
      const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10");
      const otpExpiry = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

      // Find user by email or create new user
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          email,
          name: email.split("@")[0], // Use part before @ as default name
          phone: "", // Will be updated later if needed
          otp,
          otpExpiry,
        });
      } else {
        // Update existing user with new OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;
      }

      // Save user with OTP
      await user.save();

      // Send OTP via email
      const emailSent = await emailService.sendOTP(email, otp);

      if (!emailSent) {
        res.status(500).json({
          success: false,
          message: "Failed to send OTP email. Please try again.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "OTP sent successfully to your email",
        data: {
          email,
          expiresIn: `${otpExpiryMinutes} minutes`,
        },
      });
    } catch (error) {
      console.error("Generate OTP Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Verify OTP API
  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      // Validate inputs
      if (!email || !otp) {
        res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
        return;
      }

      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Check if OTP exists
      if (!user.otp) {
        res.status(400).json({
          success: false,
          message: "No OTP found. Please request a new OTP.",
        });
        return;
      }

      // Check OTP expiry
      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        // Clear expired OTP
        user.otp = "";
        user.otpExpiry = undefined as any;
        await user.save();

        res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        });
        return;
      }

      // Verify OTP
      if (user.otp !== otp) {
        res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
        return;
      }

      // OTP is valid, clear it from database
      user.otp = undefined as any;
      user.otpExpiry = undefined as any;
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        res.status(500).json({
          success: false,
          message: "JWT secret not configured",
        });
        return;
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        jwtSecret,
        { expiresIn: "30d" }
      );

      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            profileImage: user.profileImage,
            about: user.about,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
          },
        },
      });
    } catch (error) {
      console.error("Verify OTP Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Resend OTP API
  async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Validate email
      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found. Please register first.",
        });
        return;
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Calculate new OTP expiry time
      const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10");
      const otpExpiry = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

      // Update user with new OTP
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // Send OTP via email
      const emailSent = await emailService.sendOTP(email, otp);

      if (!emailSent) {
        res.status(500).json({
          success: false,
          message: "Failed to send OTP email. Please try again.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "OTP resent successfully to your email",
        data: {
          email,
          expiresIn: `${otpExpiryMinutes} minutes`,
        },
      });
    } catch (error) {
      console.error("Resend OTP Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Logout API
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Get user from the request (set by auth middleware)
      const userId = (req as any).userId;

      if (userId) {
        // Update user status to offline
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      const user = await User.findById(userId).select("-otp -otpExpiry");

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            profileImage: user.profileImage,
            about: user.about,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
          },
        },
      });
    } catch (error) {
      console.error("Get Profile Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default new AuthController();
