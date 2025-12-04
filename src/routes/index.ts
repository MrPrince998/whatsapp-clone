import { Router } from "express";
import authRoutes from "./authRoutes";
import conversationRoutes from "./conversationRoutes";
import messageRoutes from "./messageRoutes";
import mediaRoutes from "./mediaRoutes";

const router = Router();

// Auth routes
router.use("/auth", authRoutes);

// Conversation routes
router.use("/conversations", conversationRoutes);

// Message routes
router.use("/", messageRoutes); // Messages are accessed via /conversations/:id/messages

// Media routes
router.use("/media", mediaRoutes);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    documentation: {
      swagger: "http://localhost:5000/api-docs",
      swaggerJson: "http://localhost:5000/api-docs.json",
      description: "Complete API documentation with interactive testing",
    },
    endpoints: {
      auth: {
        generateOTP: "POST /api/auth/generate-otp",
        verifyOTP: "POST /api/auth/verify-otp",
        resendOTP: "POST /api/auth/resend-otp",
        logout: "POST /api/auth/logout",
        profile: "GET /api/auth/profile",
      },
      conversations: {
        create: "POST /api/conversations",
        list: "GET /api/conversations",
        details: "GET /api/conversations/:id",
        updateGroup: "PUT /api/conversations/:id",
        addParticipants: "POST /api/conversations/:id/participants",
        removeParticipant: "DELETE /api/conversations/:id/participants/:userId",
      },
      messages: {
        send: "POST /api/conversations/:id/messages",
        list: "GET /api/conversations/:id/messages",
        details: "GET /api/messages/:id",
        updateStatus: "PATCH /api/messages/:id/status",
        edit: "PUT /api/messages/:id",
        delete: "DELETE /api/messages/:id",
        forward: "POST /api/messages/:id/forward",
      },
      media: {
        upload: "POST /api/media/upload",
        serve: "GET /api/media/files/:category/:filename",
        info: "GET /api/media/info/:category/:filename",
        delete: "DELETE /api/media/files/:category/:filename",
      },
    },
  });
});

export default router;
