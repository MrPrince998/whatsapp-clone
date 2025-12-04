import { Router } from "express";
import conversationController from "../controller/conversationController";
import { authenticateToken } from "../middleware/auth";
import {
  validateCreateConversation,
  validateAddParticipant,
  handleValidationErrors,
} from "../middleware/security";

const conversationRoutes = Router();

// All conversation routes require authentication
conversationRoutes.use(authenticateToken);

// Conversation CRUD operations with validation
conversationRoutes.post(
  "/",
  validateCreateConversation,
  handleValidationErrors,
  conversationController.createConversation
);

conversationRoutes.get("/", conversationController.getUserConversations);

conversationRoutes.get(
  "/:conversationId",
  conversationController.getConversationDetails
);

conversationRoutes.put(
  "/:conversationId",
  conversationController.updateGroupInfo
);

// Participant management with validation
conversationRoutes.post(
  "/:conversationId/participants",
  validateAddParticipant,
  handleValidationErrors,
  conversationController.addParticipants
);

conversationRoutes.delete(
  "/:conversationId/participants/:participantId",
  conversationController.removeParticipant
);

export default conversationRoutes;
