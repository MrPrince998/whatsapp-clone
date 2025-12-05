import { Request, Response } from "express";
import { Conversation } from "../model/conversations";
import { Message } from "../model/messages";
import { User } from "../model/users";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

class ConversationController {
  // Create Conversation (1-1 or group)
  async createConversation(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { participants, isGroup, groupName, groupDescription, groupImage } =
        req.body;

      // Validate participants
      if (
        !participants ||
        !Array.isArray(participants) ||
        participants.length === 0
      ) {
        res.status(400).json({
          success: false,
          message: "Participants are required",
        });
        return;
      }

      // For 1-1 chat, only allow 2 participants (sender + receiver)
      if (!isGroup && participants.length !== 1) {
        res.status(400).json({
          success: false,
          message: "One-on-one chat requires exactly one other participant",
        });
        return;
      }

      // For group chat, require group name and minimum 2 other participants
      if (isGroup) {
        if (!groupName || groupName.trim().length === 0) {
          res.status(400).json({
            success: false,
            message: "Group name is required for group chats",
          });
          return;
        }

        if (participants.length < 2) {
          res.status(400).json({
            success: false,
            message: "Group chat requires at least 2 other participants",
          });
          return;
        }
      }

      // Verify all participants exist
      const participantIds = participants.map((p: any) =>
        typeof p === "string" ? p : p.toString()
      );

      const existingUsers = await User.find({
        _id: { $in: participantIds },
      }).select("_id");

      if (existingUsers.length !== participantIds.length) {
        res.status(400).json({
          success: false,
          message: "One or more participants not found",
        });
        return;
      }

      // Add current user to participants
      const allParticipants = [userId, ...participantIds];

      // For 1-1 chat, check if conversation already exists
      if (!isGroup) {
        const existingConversation = await Conversation.findOne({
          participants: { $all: allParticipants, $size: 2 },
          isGroup: false,
        })
          .populate("participants", "name email profileImage isOnline lastSeen")
          .populate("lastMessage", "text messageType createdAt sender");

        if (existingConversation) {
          res.status(200).json({
            success: true,
            message: "Conversation already exists",
            data: { conversation: existingConversation },
          });
          return;
        }
      }

      // Create new conversation
      const conversation = new Conversation({
        participants: allParticipants,
        isGroup: isGroup || false,
        groupName: isGroup ? groupName : undefined,
        groupDescription: isGroup ? groupDescription : undefined,
        groupImage: isGroup ? groupImage : undefined,
        groupAdmin: isGroup ? userId : undefined,
      });

      await conversation.save();

      // Populate conversation details
      const populatedConversation = await Conversation.findById(
        conversation._id
      )
        .populate("participants", "name email profileImage isOnline lastSeen")
        .populate("groupAdmin", "name email profileImage")
        .populate("lastMessage", "text messageType createdAt sender");

      res.status(201).json({
        success: true,
        message: `${isGroup ? "Group" : "Conversation"} created successfully`,
        data: { conversation: populatedConversation },
      });
    } catch (error) {
      console.error("Create Conversation Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get User Conversations
  async getUserConversations(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const conversations = await Conversation.find({
        participants: userId,
      })
        .populate("participants", "name email profileImage isOnline lastSeen")
        .populate("groupAdmin", "name email profileImage")
        .populate({
          path: "lastMessage",
          select: "text messageType createdAt sender status",
          populate: {
            path: "sender",
            select: "name profileImage",
          },
        })
        .sort({ lastMessageTime: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      // Calculate unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        conversations.map(async (conversation) => {
          const unreadCount = await Message.countDocuments({
            conversationId: conversation._id,
            sender: { $ne: userId },
            seenBy: { $not: { $elemMatch: { user: userId } } },
          });

          return {
            ...conversation.toObject(),
            unreadCount,
          };
        })
      );

      const totalConversations = await Conversation.countDocuments({
        participants: userId,
      });

      res.status(200).json({
        success: true,
        data: {
          conversations: conversationsWithUnread,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalConversations / limit),
            totalConversations,
            hasMore: skip + conversations.length < totalConversations,
          },
        },
      });
    } catch (error) {
      console.error("Get User Conversations Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Add Participants to Group
  async addParticipants(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params;
      const { participants } = req.body;

      // Validate input
      if (
        !participants ||
        !Array.isArray(participants) ||
        participants.length === 0
      ) {
        res.status(400).json({
          success: false,
          message: "Participants are required",
        });
        return;
      }

      // Find conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      // Check if it's a group chat
      if (!conversation.isGroup) {
        res.status(400).json({
          success: false,
          message: "Can only add participants to group chats",
        });
        return;
      }

      // Check if user is admin or participant
      const isAdmin = conversation.groupAdmin?.toString() === userId;
      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );

      if (!isAdmin && !isParticipant) {
        res.status(403).json({
          success: false,
          message: "You are not authorized to add participants",
        });
        return;
      }

      // Verify new participants exist
      const newParticipants = await User.find({
        _id: { $in: participants },
      }).select("_id");

      if (newParticipants.length !== participants.length) {
        res.status(400).json({
          success: false,
          message: "One or more participants not found",
        });
        return;
      }

      // Add new participants (avoid duplicates)
      const currentParticipants = conversation.participants.map((p) =>
        p.toString()
      );
      const participantsToAdd = participants.filter(
        (p: string) => !currentParticipants.includes(p)
      );

      if (participantsToAdd.length === 0) {
        res.status(400).json({
          success: false,
          message: "All participants are already in the group",
        });
        return;
      }

      conversation.participants.push(...participantsToAdd);
      await conversation.save();

      // Return updated conversation
      const updatedConversation = await Conversation.findById(conversationId)
        .populate("participants", "name email profileImage isOnline lastSeen")
        .populate("groupAdmin", "name email profileImage");

      res.status(200).json({
        success: true,
        message: "Participants added successfully",
        data: { conversation: updatedConversation },
      });
    } catch (error) {
      console.error("Add Participants Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Remove Participant from Group
  async removeParticipant(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { conversationId, participantId } = req.params;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      if (!conversation.isGroup) {
        res.status(400).json({
          success: false,
          message: "Can only remove participants from group chats",
        });
        return;
      }

      // Check if user is admin
      const isAdmin = conversation.groupAdmin?.toString() === userId;
      const isSelfRemoval = participantId === userId;

      if (!isAdmin && !isSelfRemoval) {
        res.status(403).json({
          success: false,
          message: "Only group admin can remove participants",
        });
        return;
      }

      // Remove participant
      conversation.participants = conversation.participants.filter(
        (p) => p.toString() !== participantId
      );

      // If admin leaves, transfer admin to next participant
      if (isSelfRemoval && isAdmin && conversation.participants.length > 0) {
        conversation.groupAdmin = conversation.participants[0];
      }

      await conversation.save();

      res.status(200).json({
        success: true,
        message: "Participant removed successfully",
      });
    } catch (error) {
      console.error("Remove Participant Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get Conversation Details
  async getConversationDetails(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params;

      const conversation = await Conversation.findById(conversationId)
        .populate(
          "participants",
          "name email profileImage isOnline lastSeen about"
        )
        .populate("groupAdmin", "name email profileImage")
        .populate({
          path: "lastMessage",
          select: "text messageType createdAt sender status",
          populate: {
            path: "sender",
            select: "name profileImage",
          },
        });

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

      // Calculate unread count
      const unreadCount = await Message.countDocuments({
        conversationId: conversation._id,
        sender: { $ne: userId },
        seenBy: { $not: { $elemMatch: { user: userId } } },
      });

      res.status(200).json({
        success: true,
        data: {
          conversation: {
            ...conversation.toObject(),
            unreadCount,
          },
        },
      });
    } catch (error) {
      console.error("Get Conversation Details Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update Group Info
  async updateGroupInfo(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params;
      const { groupName, groupDescription, groupImage } = req.body;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      if (!conversation.isGroup) {
        res.status(400).json({
          success: false,
          message: "Can only update group chat information",
        });
        return;
      }

      // Check if user is admin
      if (conversation.groupAdmin?.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: "Only group admin can update group information",
        });
        return;
      }

      // Update group info
      if (groupName !== undefined) conversation.groupName = groupName;
      if (groupDescription !== undefined)
        conversation.groupDescription = groupDescription;
      if (groupImage !== undefined) conversation.groupImage = groupImage;

      await conversation.save();

      const updatedConversation = await Conversation.findById(conversationId)
        .populate("participants", "name email profileImage isOnline lastSeen")
        .populate("groupAdmin", "name email profileImage");

      res.status(200).json({
        success: true,
        message: "Group information updated successfully",
        data: { conversation: updatedConversation },
      });
    } catch (error) {
      console.error("Update Group Info Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default new ConversationController();
