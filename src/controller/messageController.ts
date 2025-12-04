import { Request, Response } from "express";
import { Message } from "../model/messages";
import { Conversation } from "../model/conversations";
import { User } from "../model/users";
import mongoose from "mongoose";
import { getFileCategory, getFileUrl } from "../config/multer";

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

class MessageController {
  // Send Message
  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params;
      const {
        text,
        messageType = "text",
        mediaUrl,
        fileName,
        fileSize,
        repliedTo,
        forwardedFrom,
      } = req.body;

      // Validate conversation
      const conversation = await Conversation.findById(conversationId).populate(
        "participants",
        "_id"
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      // Check if user is participant
      const isParticipant = conversation.participants.some(
        (p) => p._id.toString() === userId
      );

      if (!isParticipant) {
        res.status(403).json({
          success: false,
          message: "You are not a participant in this conversation",
        });
        return;
      }

      // Validate message content
      if (messageType === "text" && (!text || text.trim().length === 0)) {
        res.status(400).json({
          success: false,
          message: "Text content is required for text messages",
        });
        return;
      }

      if (messageType !== "text" && !mediaUrl) {
        res.status(400).json({
          success: false,
          message: "Media URL is required for non-text messages",
        });
        return;
      }

      // Validate replied message if specified
      if (repliedTo) {
        const repliedMessage = await Message.findOne({
          _id: repliedTo,
          conversationId: conversationId,
        });

        if (!repliedMessage) {
          res.status(400).json({
            success: false,
            message: "Replied message not found in this conversation",
          });
          return;
        }
      }

      // Create message
      const message = new Message({
        conversationId,
        sender: userId,
        messageType,
        text: text?.trim(),
        mediaUrl,
        fileName,
        fileSize,
        repliedTo,
        forwardedFrom,
        status: "sent",
      });

      await message.save();

      // Update conversation last message and time
      conversation.lastMessage = message._id;
      conversation.lastMessageTime = new Date();
      await conversation.save();

      // Auto-mark as delivered to all participants except sender
      const otherParticipants = conversation.participants.filter(
        (p) => p._id.toString() !== userId
      );

      if (otherParticipants.length > 0) {
        message.deliveredTo = otherParticipants.map((p) => ({
          user: p._id,
          deliveredAt: new Date(),
        }));
        message.status = "delivered";
        await message.save();
      }

      // Populate message for response
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name profileImage")
        .populate("repliedTo", "text messageType sender createdAt")
        .populate({
          path: "repliedTo",
          populate: {
            path: "sender",
            select: "name profileImage",
          },
        });

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: { message: populatedMessage },
      });
    } catch (error) {
      console.error("Send Message Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Send Message with Media Upload
  async sendMessageWithMedia(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params;
      const { text, messageType, repliedTo } = req.body;

      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      // Validate conversation
      const conversation = await Conversation.findById(conversationId).populate(
        "participants",
        "_id"
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      // Check if user is participant
      const isParticipant = conversation.participants.some(
        (p) => p._id.toString() === userId
      );

      if (!isParticipant) {
        res.status(403).json({
          success: false,
          message: "You are not a participant in this conversation",
        });
        return;
      }

      // Handle file upload
      const { file } = req;
      const category = getFileCategory(file.mimetype);
      const mediaUrl = getFileUrl(file.filename, category);

      // Determine message type based on file type if not provided
      let finalMessageType = messageType;
      if (!finalMessageType) {
        if (file.mimetype.startsWith("image/")) {
          finalMessageType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          finalMessageType = "video";
        } else if (file.mimetype.startsWith("audio/")) {
          finalMessageType = "audio";
        } else {
          finalMessageType = "file";
        }
      }

      // Validate replied message if provided
      if (repliedTo) {
        const repliedMessage = await Message.findById(repliedTo);
        if (
          !repliedMessage ||
          repliedMessage.conversationId.toString() !== conversationId
        ) {
          res.status(400).json({
            success: false,
            message: "Replied message not found in this conversation",
          });
          return;
        }
      }

      // Create message
      const message = new Message({
        conversationId,
        sender: userId,
        messageType: finalMessageType,
        text: text?.trim() || "",
        mediaUrl,
        fileName: file.originalname,
        fileSize: file.size,
        repliedTo,
        status: "sent",
      });

      await message.save();

      // Update conversation last message and time
      conversation.lastMessage = message._id;
      conversation.lastMessageTime = new Date();
      await conversation.save();

      // Auto-mark as delivered to all participants except sender
      const otherParticipants = conversation.participants.filter(
        (p) => p._id.toString() !== userId
      );

      if (otherParticipants.length > 0) {
        message.deliveredTo = otherParticipants.map((p) => ({
          user: p._id,
          deliveredAt: new Date(),
        }));
        message.status = "delivered";
        await message.save();
      }

      // Populate message for response
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name profileImage")
        .populate("repliedTo", "text messageType sender createdAt")
        .populate({
          path: "repliedTo",
          populate: {
            path: "sender",
            select: "name profileImage",
          },
        });

      res.status(201).json({
        success: true,
        message: "Message with media sent successfully",
        data: { message: populatedMessage },
      });
    } catch (error) {
      console.error("Send Message with Media Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get Messages in Conversation
  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      // Validate conversation and user participation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );

      if (!isParticipant) {
        res.status(403).json({
          success: false,
          message: "You are not a participant in this conversation",
        });
        return;
      }

      // Get messages with pagination (newest first)
      const messages = await Message.find({
        conversationId,
        deleted: false,
      })
        .populate("sender", "name profileImage")
        .populate("repliedTo", "text messageType sender createdAt")
        .populate({
          path: "repliedTo",
          populate: {
            path: "sender",
            select: "name profileImage",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalMessages = await Message.countDocuments({
        conversationId,
        deleted: false,
      });

      // Mark messages as seen by current user
      const unseenMessages = messages.filter(
        (msg) =>
          msg.sender.toString() !== userId &&
          !msg.seenBy.some((seen) => seen?.user.toString() === userId)
      );

      if (unseenMessages.length > 0) {
        await Message.updateMany(
          {
            _id: { $in: unseenMessages.map((msg) => msg._id) },
            sender: { $ne: userId },
          },
          {
            $addToSet: {
              seenBy: {
                user: userId,
                seenAt: new Date(),
              },
            },
            $set: { status: "seen" },
          }
        );
      }

      // Reverse to show oldest first in the response
      const orderedMessages = messages.reverse();

      res.status(200).json({
        success: true,
        data: {
          messages: orderedMessages,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
            hasMore: skip + messages.length < totalMessages,
          },
        },
      });
    } catch (error) {
      console.error("Get Messages Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update Message Status
  async updateMessageStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { messageId } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ["delivered", "seen"];
      if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be "delivered" or "seen"',
        });
        return;
      }

      // Find message
      const message = await Message.findById(messageId);
      if (!message) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      // Verify user is participant in the conversation
      const conversation = await Conversation.findById(message.conversationId);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );

      if (!isParticipant) {
        res.status(403).json({
          success: false,
          message: "You are not a participant in this conversation",
        });
        return;
      }

      // Cannot update status of own messages
      if (message.sender.toString() === userId) {
        res.status(400).json({
          success: false,
          message: "Cannot update status of your own messages",
        });
        return;
      }

      // Update status based on type
      if (status === "delivered") {
        // Add to deliveredTo if not already there
        const alreadyDelivered = message.deliveredTo.some(
          (d) => d.user.toString() === userId
        );

        if (!alreadyDelivered) {
          message.deliveredTo.push({
            user: userId as any,
            deliveredAt: new Date(),
          });
        }

        // Update overall status if this is the first delivery
        if (message.status === "sent") {
          message.status = "delivered";
        }
      } else if (status === "seen") {
        // Add to seenBy if not already there
        const alreadySeen = message.seenBy.some(
          (s) => s.user.toString() === userId
        );

        if (!alreadySeen) {
          message.seenBy.push({
            user: userId as any,
            seenAt: new Date(),
          });

          // Also add to deliveredTo if not there
          const alreadyDelivered = message.deliveredTo.some(
            (d) => d.user.toString() === userId
          );

          if (!alreadyDelivered) {
            message.deliveredTo.push({
              user: userId as any,
              deliveredAt: new Date(),
            });
          }
        }

        // Update overall status
        message.status = "seen";
      }

      await message.save();

      res.status(200).json({
        success: true,
        message: "Message status updated successfully",
        data: { messageId, status, updatedAt: new Date() },
      });
    } catch (error) {
      console.error("Update Message Status Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Forward Message
  async forwardMessage(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { messageId } = req.params;
      const { conversationIds } = req.body;

      // Validate input
      if (
        !conversationIds ||
        !Array.isArray(conversationIds) ||
        conversationIds.length === 0
      ) {
        res.status(400).json({
          success: false,
          message: "Conversation IDs are required",
        });
        return;
      }

      // Find original message
      const originalMessage = await Message.findById(messageId);
      if (!originalMessage) {
        res.status(404).json({
          success: false,
          message: "Original message not found",
        });
        return;
      }

      // Verify user has access to original message
      const originalConversation = await Conversation.findById(
        originalMessage.conversationId
      );
      if (
        !originalConversation?.participants.some((p) => p.toString() === userId)
      ) {
        res.status(403).json({
          success: false,
          message: "You do not have access to this message",
        });
        return;
      }

      // Verify user is participant in target conversations
      const targetConversations = await Conversation.find({
        _id: { $in: conversationIds },
        participants: userId,
      });

      if (targetConversations.length !== conversationIds.length) {
        res.status(403).json({
          success: false,
          message:
            "You are not a participant in one or more target conversations",
        });
        return;
      }

      // Create forwarded messages
      const forwardedMessages = await Promise.all(
        targetConversations.map(async (conversation) => {
          const forwardedMessage = new Message({
            conversationId: conversation._id,
            sender: userId,
            messageType: originalMessage.messageType,
            text: originalMessage.text,
            mediaUrl: originalMessage.mediaUrl,
            fileName: originalMessage.fileName,
            fileSize: originalMessage.fileSize,
            forwardedFrom: originalMessage._id,
            status: "sent",
          });

          await forwardedMessage.save();

          // Update conversation last message
          conversation.lastMessage = forwardedMessage._id;
          conversation.lastMessageTime = new Date();
          await conversation.save();

          return forwardedMessage;
        })
      );

      res.status(201).json({
        success: true,
        message: "Message forwarded successfully",
        data: {
          forwardedTo: conversationIds.length,
          messageIds: forwardedMessages.map((msg) => msg._id),
        },
      });
    } catch (error) {
      console.error("Forward Message Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Edit Message
  async editMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { messageId } = req.params;
      const { text } = req.body;

      // Validate input
      if (!text || text.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Message text is required",
        });
        return;
      }

      // Find message
      const message = await Message.findById(messageId);
      if (!message) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      // Verify user is sender
      if (message.sender.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: "You can only edit your own messages",
        });
        return;
      }

      // Only text messages can be edited
      if (message.messageType !== "text") {
        res.status(400).json({
          success: false,
          message: "Only text messages can be edited",
        });
        return;
      }

      // Check if message is not too old (24 hours limit)
      const hoursSinceCreated =
        (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreated > 24) {
        res.status(400).json({
          success: false,
          message: "Messages older than 24 hours cannot be edited",
        });
        return;
      }

      // Update message
      message.text = text.trim();
      message.editedAt = new Date();
      await message.save();

      // Populate and return updated message
      const updatedMessage = await Message.findById(messageId)
        .populate("sender", "name profileImage")
        .populate("repliedTo", "text messageType sender createdAt");

      res.status(200).json({
        success: true,
        message: "Message edited successfully",
        data: { message: updatedMessage },
      });
    } catch (error) {
      console.error("Edit Message Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete Message
  async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { messageId } = req.params;
      const { deleteForEveryone = false } = req.body;

      // Find message
      const message = await Message.findById(messageId);
      if (!message) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      // Verify user is sender
      if (message.sender.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: "You can only delete your own messages",
        });
        return;
      }

      if (deleteForEveryone) {
        // Check if message is not too old (1 hour limit for delete for everyone)
        const hoursSinceCreated =
          (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreated > 1) {
          res.status(400).json({
            success: false,
            message:
              "Messages older than 1 hour cannot be deleted for everyone",
          });
          return;
        }

        // Mark as deleted for everyone
        message.deleted = true;
        message.deletedAt = new Date();
        message.text = "This message was deleted";
        await message.save();
      } else {
        // For now, we'll implement delete for everyone only
        // In a full implementation, you'd have a deletedFor array
        message.deleted = true;
        message.deletedAt = new Date();
        message.text = "This message was deleted";
        await message.save();
      }

      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error) {
      console.error("Delete Message Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get Message Details
  async getMessageDetails(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { messageId } = req.params;

      const message = await Message.findById(messageId)
        .populate("sender", "name profileImage")
        .populate("repliedTo", "text messageType sender createdAt")
        .populate("deliveredTo.user", "name profileImage")
        .populate("seenBy.user", "name profileImage")
        .populate({
          path: "repliedTo",
          populate: {
            path: "sender",
            select: "name profileImage",
          },
        });

      if (!message) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      // Verify user has access to the message
      const conversation = await Conversation.findById(message.conversationId);
      if (!conversation?.participants.some((p) => p.toString() === userId)) {
        res.status(403).json({
          success: false,
          message: "You do not have access to this message",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { message },
      });
    } catch (error) {
      console.error("Get Message Details Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default new MessageController();
