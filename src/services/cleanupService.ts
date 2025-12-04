import cron from "node-cron";
import { User } from "../model/users";
import fs from "fs";
import path from "path";
import { Message } from "../model/messages";

class CleanupService {
  private static instance: CleanupService;
  private isRunning: boolean = false;

  static getInstance(): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  start(): void {
    if (this.isRunning) {
      console.log("Cleanup service is already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting cleanup service...");

    // Clean expired OTPs every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      await this.cleanExpiredOTPs();
    });

    // Clean unused uploaded files every hour
    cron.schedule("0 * * * *", async () => {
      await this.cleanUnusedFiles();
    });

    // Clean old temporary sessions every day at 2 AM
    cron.schedule("0 2 * * *", async () => {
      await this.cleanOldSessions();
    });

    console.log("Cleanup service started successfully");
  }

  stop(): void {
    this.isRunning = false;
    console.log("Cleanup service stopped");
  }

  // Remove expired OTPs from users
  private async cleanExpiredOTPs(): Promise<void> {
    try {
      const now = new Date();

      const result = await User.updateMany(
        {
          otpExpiry: { $lt: now },
          $or: [
            { otp: { $exists: true, $ne: null } },
            { otpExpiry: { $exists: true, $ne: null } },
          ],
        },
        {
          $unset: {
            otp: 1,
            otpExpiry: 1,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`🧹 Cleaned ${result.modifiedCount} expired OTPs`);
      }
    } catch (error) {
      console.error("Error cleaning expired OTPs:", error);
    }
  }

  // Remove uploaded files that are not referenced in any messages
  private async cleanUnusedFiles(): Promise<void> {
    try {
      const uploadDir = path.join(process.cwd(), "uploads");
      const categories = ["images", "videos", "audio", "files"];
      let cleanedCount = 0;

      for (const category of categories) {
        const categoryDir = path.join(uploadDir, category);

        if (!fs.existsSync(categoryDir)) continue;

        const files = fs.readdirSync(categoryDir);

        for (const file of files) {
          const filePath = path.join(categoryDir, file);
          const fileUrl = `/api/media/files/${category}/${file}`;

          // Check if file is referenced in any message
          const messageCount = await Message.countDocuments({
            mediaUrl: fileUrl,
          });

          if (messageCount === 0) {
            // Check if file is older than 24 hours
            const stats = fs.statSync(filePath);
            const fileAge = Date.now() - stats.mtime.getTime();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (fileAge > twentyFourHours) {
              try {
                fs.unlinkSync(filePath);
                cleanedCount++;
              } catch (error) {
                console.error(`Error deleting file ${filePath}:`, error);
              }
            }
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} unused files`);
      }
    } catch (error) {
      console.error("Error cleaning unused files:", error);
    }
  }

  // Clean old user sessions (users who haven't been online for 30 days)
  private async cleanOldSessions(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await User.updateMany(
        {
          isOnline: false,
          lastSeen: { $lt: thirtyDaysAgo },
        },
        {
          $set: {
            lastSeen: null,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `🧹 Cleaned lastSeen data for ${result.modifiedCount} inactive users`
        );
      }
    } catch (error) {
      console.error("Error cleaning old sessions:", error);
    }
  }

  // Manual cleanup functions for immediate use
  async cleanExpiredOTPsNow(): Promise<number> {
    try {
      const now = new Date();

      const result = await User.updateMany(
        {
          otpExpiry: { $lt: now },
          $or: [
            { otp: { $exists: true, $ne: null } },
            { otpExpiry: { $exists: true, $ne: null } },
          ],
        },
        {
          $unset: {
            otp: 1,
            otpExpiry: 1,
          },
        }
      );

      return result.modifiedCount;
    } catch (error) {
      console.error("Error in manual OTP cleanup:", error);
      return 0;
    }
  }

  async getCleanupStats(): Promise<{
    expiredOTPs: number;
    unusedFiles: number;
    inactiveUsers: number;
  }> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [expiredOTPs, inactiveUsers] = await Promise.all([
        User.countDocuments({
          otpExpiry: { $lt: now },
          $or: [
            { otp: { $exists: true, $ne: null } },
            { otpExpiry: { $exists: true, $ne: null } },
          ],
        }),
        User.countDocuments({
          isOnline: false,
          lastSeen: { $lt: thirtyDaysAgo },
        }),
      ]);

      // Count unused files
      let unusedFiles = 0;
      try {
        const uploadDir = path.join(process.cwd(), "uploads");
        const categories = ["images", "videos", "audio", "files"];

        for (const category of categories) {
          const categoryDir = path.join(uploadDir, category);

          if (!fs.existsSync(categoryDir)) continue;

          const files = fs.readdirSync(categoryDir);

          for (const file of files) {
            const fileUrl = `/api/media/files/${category}/${file}`;
            const messageCount = await Message.countDocuments({
              mediaUrl: fileUrl,
            });

            if (messageCount === 0) {
              const filePath = path.join(categoryDir, file);
              const stats = fs.statSync(filePath);
              const fileAge = Date.now() - stats.mtime.getTime();
              const twentyFourHours = 24 * 60 * 60 * 1000;

              if (fileAge > twentyFourHours) {
                unusedFiles++;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error counting unused files:", error);
      }

      return {
        expiredOTPs,
        unusedFiles,
        inactiveUsers,
      };
    } catch (error) {
      console.error("Error getting cleanup stats:", error);
      return {
        expiredOTPs: 0,
        unusedFiles: 0,
        inactiveUsers: 0,
      };
    }
  }
}

export default CleanupService;
