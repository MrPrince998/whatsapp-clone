import { Router } from "express";
import messageController from "../controller/messageController";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../config/multer";
import {
  messageRateLimit,
  mediaUploadRateLimit,
  validateSendMessage,
  handleValidationErrors,
} from "../middleware/security";

const messageRoutes = Router();

// All message routes require authentication
messageRoutes.use(authenticateToken);

// Message operations with rate limiting and validation
messageRoutes.post(
  "/conversations/:conversationId/messages",
  messageRateLimit,
  validateSendMessage,
  handleValidationErrors,
  messageController.sendMessage
);

// Send message with media upload
messageRoutes.post(
  "/conversations/:conversationId/messages/media",
  mediaUploadRateLimit,
  upload.single("file"),
  handleValidationErrors,
  messageController.sendMessageWithMedia
);

messageRoutes.get(
  "/conversations/:conversationId/messages",
  messageController.getMessages
);

messageRoutes.get("/messages/:messageId", messageController.getMessageDetails);

// Message status and modifications
messageRoutes.patch(
  "/messages/:messageId/status",
  messageController.updateMessageStatus
);

messageRoutes.put(
  "/messages/:messageId",
  validateSendMessage,
  handleValidationErrors,
  messageController.editMessage
);

messageRoutes.delete("/messages/:messageId", messageController.deleteMessage);

// Message actions
messageRoutes.post(
  "/messages/:messageId/forward",
  messageController.forwardMessage
);

export default messageRoutes;
