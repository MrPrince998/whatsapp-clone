import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import {
  socketAuthMiddleware,
  AuthenticatedSocket,
} from "../middleware/socketAuth";
import { Conversation } from "../model/conversations";
import { Message } from "../model/messages";
import { User } from "../model/users";

interface UserSession {
  userId: string;
  socketId: string;
  user: any;
  joinedRooms: Set<string>;
  isOnline: boolean;
  lastSeen: Date;
}

class SocketManager {
  private io: SocketServer;
  private userSessions: Map<string, UserSession> = new Map(); // userId -> session
  private socketToUser: Map<string, string> = new Map(); // socketId -> userId
  private roomParticipants: Map<string, Set<string>> = new Map(); // roomId -> userIds
  private typingUsers: Map<string, Map<string, NodeJS.Timeout>> = new Map(); // roomId -> userId -> timeout

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: "*", // Configure this for production
        methods: ["GET", "POST"],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(socketAuthMiddleware);
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private async handleConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    const user = socket.user;

    console.log(`User connected: ${user.name} (${socket.id})`);

    // Store session info
    const session: UserSession = {
      userId,
      socketId: socket.id,
      user,
      joinedRooms: new Set(),
      isOnline: true,
      lastSeen: new Date(),
    };

    this.userSessions.set(userId, session);
    this.socketToUser.set(socket.id, userId);

    // Update user online status in database
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    // Emit user came online to all their conversation participants
    await this.broadcastUserStatusToContacts(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    // Setup event listeners for this socket
    this.setupSocketEvents(socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      this.handleDisconnection(socket);
    });
  }

  private setupSocketEvents(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Join conversation room
    socket.on("joinRoom", async (data: { conversationId: string }) => {
      await this.handleJoinRoom(socket, data);
    });

    // Leave conversation room
    socket.on("leaveRoom", async (data: { conversationId: string }) => {
      await this.handleLeaveRoom(socket, data);
    });

    // Send message
    socket.on("sendMessage", async (data: any) => {
      await this.handleSendMessage(socket, data);
    });

    // Message status update
    socket.on(
      "messageStatusUpdate",
      async (data: { messageId: string; status: string }) => {
        await this.handleMessageStatusUpdate(socket, data);
      }
    );

    // Typing indicators
    socket.on(
      "typing",
      (data: { conversationId: string; isTyping: boolean }) => {
        this.handleTyping(socket, data);
      }
    );

    // Mark messages as seen
    socket.on(
      "markMessagesAsSeen",
      async (data: { conversationId: string; messageIds: string[] }) => {
        await this.handleMarkMessagesAsSeen(socket, data);
      }
    );

    // User went online/offline
    socket.on("updateOnlineStatus", async (data: { isOnline: boolean }) => {
      await this.handleUpdateOnlineStatus(socket, data);
    });

    // Get online users in conversation
    socket.on("getOnlineUsers", (data: { conversationId: string }) => {
      this.handleGetOnlineUsers(socket, data);
    });
  }

  private async handleJoinRoom(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    try {
      const userId = socket.userId!;
      const { conversationId } = data;

      // Verify user is participant in conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit("error", { message: "Conversation not found" });
        return;
      }

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant) {
        socket.emit("error", {
          message: "You are not a participant in this conversation",
        });
        return;
      }

      // Join the socket room
      await socket.join(conversationId);

      // Update session
      const session = this.userSessions.get(userId);
      if (session) {
        session.joinedRooms.add(conversationId);
      }

      // Update room participants
      if (!this.roomParticipants.has(conversationId)) {
        this.roomParticipants.set(conversationId, new Set());
      }
      this.roomParticipants.get(conversationId)!.add(userId);

      console.log(`User ${userId} joined room ${conversationId}`);

      // Notify others in the room that user joined
      socket.to(conversationId).emit("userJoinedRoom", {
        userId,
        user: session?.user,
        conversationId,
      });

      // Confirm join to the user
      socket.emit("joinedRoom", {
        conversationId,
        message: "Successfully joined conversation",
      });

      // Send online users list
      this.sendOnlineUsersToRoom(conversationId);
    } catch (error) {
      console.error("Join room error:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  }

  private async handleLeaveRoom(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    try {
      const userId = socket.userId!;
      const { conversationId } = data;

      // Leave the socket room
      await socket.leave(conversationId);

      // Update session
      const session = this.userSessions.get(userId);
      if (session) {
        session.joinedRooms.delete(conversationId);
      }

      // Update room participants
      const roomUsers = this.roomParticipants.get(conversationId);
      if (roomUsers) {
        roomUsers.delete(userId);
        if (roomUsers.size === 0) {
          this.roomParticipants.delete(conversationId);
        }
      }

      // Clear any typing status
      this.clearTypingStatus(conversationId, userId);

      console.log(`User ${userId} left room ${conversationId}`);

      // Notify others in the room that user left
      socket.to(conversationId).emit("userLeftRoom", {
        userId,
        conversationId,
      });

      // Confirm leave to the user
      socket.emit("leftRoom", {
        conversationId,
        message: "Left conversation",
      });
    } catch (error) {
      console.error("Leave room error:", error);
      socket.emit("error", { message: "Failed to leave room" });
    }
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: any) {
    try {
      const userId = socket.userId!;
      const {
        conversationId,
        text,
        messageType = "text",
        mediaUrl,
        fileName,
        fileSize,
        repliedTo,
      } = data;

      // Verify user is in the room
      if (!socket.rooms.has(conversationId)) {
        socket.emit("error", { message: "You must join the room first" });
        return;
      }

      // Create message in database
      const message = new Message({
        conversationId,
        sender: userId,
        messageType,
        text: text?.trim(),
        mediaUrl,
        fileName,
        fileSize,
        repliedTo,
        status: "sent",
      });

      await message.save();

      // Update conversation last message
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessageTime: new Date(),
      });

      // Populate message for broadcast
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name profileImage email")
        .populate("repliedTo", "text messageType sender createdAt");

      // Mark as delivered for online participants
      const roomUsers = this.roomParticipants.get(conversationId) || new Set();
      const deliveredTo: any[] = [];

      roomUsers.forEach((participantId) => {
        if (participantId !== userId) {
          // Don't deliver to sender
          deliveredTo.push({
            user: participantId,
            deliveredAt: new Date(),
          });
        }
      });

      if (deliveredTo.length > 0) {
        message.deliveredTo.push(...deliveredTo);
        message.status = "delivered";
        await message.save();
      }

      // Clear typing status for sender
      this.clearTypingStatus(conversationId, userId);

      // Broadcast message to room participants
      this.io.to(conversationId).emit("receiveMessage", {
        message: populatedMessage,
        conversationId,
      });

      // Send delivery confirmations to online users
      roomUsers.forEach((participantId) => {
        if (participantId !== userId) {
          const participantSession = this.userSessions.get(participantId);
          if (participantSession) {
            this.io.to(participantSession.socketId).emit("messageDelivered", {
              messageId: message._id,
              conversationId,
              deliveredAt: new Date(),
            });
          }
        }
      });

      console.log(`Message sent in room ${conversationId} by ${userId}`);
    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  private async handleMessageStatusUpdate(
    socket: AuthenticatedSocket,
    data: { messageId: string; status: string }
  ) {
    try {
      const userId = socket.userId!;
      const { messageId, status } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      // Don't update status of own messages
      if (message.sender.toString() === userId) {
        return;
      }

      let updated = false;

      if (status === "delivered") {
        const alreadyDelivered = message.deliveredTo.some(
          (d) => d.user?.toString() === userId
        );
        if (!alreadyDelivered) {
          message.deliveredTo.push({
            user: userId as any,
            deliveredAt: new Date(),
          });
          if (message.status === "sent") {
            message.status = "delivered";
          }
          updated = true;
        }
      } else if (status === "seen") {
        const alreadySeen = message.seenBy.some(
          (s) => s.user?.toString() === userId
        );
        if (!alreadySeen) {
          message.seenBy.push({
            user: userId as any,
            seenAt: new Date(),
          });

          // Also mark as delivered if not already
          const alreadyDelivered = message.deliveredTo.some(
            (d) => d.user?.toString() === userId
          );
          if (!alreadyDelivered) {
            message.deliveredTo.push({
              user: userId as any,
              deliveredAt: new Date(),
            });
          }

          message.status = "seen";
          updated = true;
        }
      }

      if (updated) {
        await message.save();

        // Notify sender about status update
        const senderSession = this.userSessions.get(message.sender.toString());
        if (senderSession) {
          this.io.to(senderSession.socketId).emit("messageStatusUpdated", {
            messageId,
            status,
            userId,
            updatedAt: new Date(),
          });
        }

        console.log(`Message ${messageId} marked as ${status} by ${userId}`);
      }
    } catch (error) {
      console.error("Message status update error:", error);
      socket.emit("error", { message: "Failed to update message status" });
    }
  }

  private handleTyping(
    socket: AuthenticatedSocket,
    data: { conversationId: string; isTyping: boolean }
  ) {
    try {
      const userId = socket.userId!;
      const { conversationId, isTyping } = data;

      // Verify user is in the room
      if (!socket.rooms.has(conversationId)) {
        return;
      }

      if (isTyping) {
        // Set typing status
        if (!this.typingUsers.has(conversationId)) {
          this.typingUsers.set(conversationId, new Map());
        }

        const conversationTyping = this.typingUsers.get(conversationId)!;

        // Clear existing timeout
        const existingTimeout = conversationTyping.get(userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set new timeout (auto-clear after 3 seconds)
        const timeout = setTimeout(() => {
          this.clearTypingStatus(conversationId, userId);
          this.broadcastTypingStatus(conversationId);
        }, 3000);

        conversationTyping.set(userId, timeout);
      } else {
        // Clear typing status
        this.clearTypingStatus(conversationId, userId);
      }

      // Broadcast typing status to room (except sender)
      this.broadcastTypingStatus(conversationId, userId);
    } catch (error) {
      console.error("Typing handler error:", error);
    }
  }

  private async handleMarkMessagesAsSeen(
    socket: AuthenticatedSocket,
    data: { conversationId: string; messageIds: string[] }
  ) {
    try {
      const userId = socket.userId!;
      const { conversationId, messageIds } = data;

      // Verify user is in the conversation
      const conversation = await Conversation.findById(conversationId);
      if (
        !conversation ||
        !conversation.participants.some((p) => p.toString() === userId)
      ) {
        return;
      }

      // Update messages as seen
      const result = await Message.updateMany(
        {
          _id: { $in: messageIds },
          conversationId,
          sender: { $ne: userId },
          "seenBy.user": { $ne: userId },
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

      if (result.modifiedCount > 0) {
        // Get the updated messages to find their senders
        const updatedMessages = await Message.find({
          _id: { $in: messageIds },
          conversationId,
        });

        // Notify senders about seen status
        const notifiedSenders = new Set<string>();
        updatedMessages.forEach((message) => {
          const senderId = message.sender.toString();
          if (!notifiedSenders.has(senderId)) {
            const senderSession = this.userSessions.get(senderId);
            if (senderSession) {
              this.io.to(senderSession.socketId).emit("messagesMarkedAsSeen", {
                conversationId,
                messageIds: updatedMessages
                  .filter((m) => m.sender.toString() === senderId)
                  .map((m) => m._id),
                seenBy: userId,
                seenAt: new Date(),
              });
            }
            notifiedSenders.add(senderId);
          }
        });
      }
    } catch (error) {
      console.error("Mark messages as seen error:", error);
    }
  }

  private async handleUpdateOnlineStatus(
    socket: AuthenticatedSocket,
    data: { isOnline: boolean }
  ) {
    try {
      const userId = socket.userId!;
      const { isOnline } = data;

      // Update session
      const session = this.userSessions.get(userId);
      if (session) {
        session.isOnline = isOnline;
        session.lastSeen = new Date();
      }

      // Update database
      await User.findByIdAndUpdate(userId, {
        isOnline,
        lastSeen: new Date(),
      });

      // Broadcast status to contacts
      await this.broadcastUserStatusToContacts(userId, {
        isOnline,
        lastSeen: new Date(),
      });
    } catch (error) {
      console.error("Update online status error:", error);
    }
  }

  private handleGetOnlineUsers(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ) {
    try {
      const { conversationId } = data;
      this.sendOnlineUsersToSocket(socket, conversationId);
    } catch (error) {
      console.error("Get online users error:", error);
    }
  }

  private async handleDisconnection(socket: AuthenticatedSocket) {
    try {
      const userId = this.socketToUser.get(socket.id);
      if (!userId) return;

      console.log(`User disconnected: ${userId} (${socket.id})`);

      // Clear all typing statuses for this user
      this.typingUsers.forEach((conversationTyping, conversationId) => {
        if (conversationTyping.has(userId)) {
          this.clearTypingStatus(conversationId, userId);
          this.broadcastTypingStatus(conversationId);
        }
      });

      // Remove from room participants
      this.roomParticipants.forEach((users, roomId) => {
        if (users.has(userId)) {
          users.delete(userId);
          if (users.size === 0) {
            this.roomParticipants.delete(roomId);
          } else {
            // Notify remaining users
            this.io
              .to(roomId)
              .emit("userLeftRoom", { userId, conversationId: roomId });
          }
        }
      });

      // Update user status
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Broadcast offline status to contacts
      await this.broadcastUserStatusToContacts(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Clean up session data
      this.userSessions.delete(userId);
      this.socketToUser.delete(socket.id);
    } catch (error) {
      console.error("Disconnect handler error:", error);
    }
  }

  // Helper methods
  private clearTypingStatus(conversationId: string, userId: string) {
    const conversationTyping = this.typingUsers.get(conversationId);
    if (conversationTyping) {
      const timeout = conversationTyping.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        conversationTyping.delete(userId);
      }
      if (conversationTyping.size === 0) {
        this.typingUsers.delete(conversationId);
      }
    }
  }

  private broadcastTypingStatus(
    conversationId: string,
    excludeUserId?: string
  ) {
    const conversationTyping = this.typingUsers.get(conversationId);
    const typingUserIds = conversationTyping
      ? Array.from(conversationTyping.keys())
      : [];

    // Get typing users info
    const typingUsers = typingUserIds
      .map((userId) => {
        const session = this.userSessions.get(userId);
        return session
          ? {
              userId,
              name: session.user.name,
              profileImage: session.user.profileImage,
            }
          : null;
      })
      .filter(Boolean);

    // Broadcast to all room members except the typer
    const targetSocket = excludeUserId
      ? this.io
          .to(conversationId)
          .except(this.userSessions.get(excludeUserId)?.socketId || "")
      : this.io.to(conversationId);

    targetSocket.emit("typingUpdate", {
      conversationId,
      typingUsers,
    });
  }

  private async broadcastUserStatusToContacts(
    userId: string,
    status: { isOnline: boolean; lastSeen: Date }
  ) {
    try {
      // Find all conversations this user is part of
      const conversations = await Conversation.find({
        participants: userId,
      }).select("participants");

      // Get all unique contact user IDs
      const contactIds = new Set<string>();
      conversations.forEach((conversation) => {
        conversation.participants.forEach((participantId) => {
          const id = participantId.toString();
          if (id !== userId) {
            contactIds.add(id);
          }
        });
      });

      // Send status update to online contacts
      contactIds.forEach((contactId) => {
        const contactSession = this.userSessions.get(contactId);
        if (contactSession) {
          this.io.to(contactSession.socketId).emit("userStatusUpdate", {
            userId,
            ...status,
          });
        }
      });
    } catch (error) {
      console.error("Broadcast status error:", error);
    }
  }

  private sendOnlineUsersToRoom(conversationId: string) {
    const roomUsers = this.roomParticipants.get(conversationId);
    if (!roomUsers) return;

    const onlineUsers = Array.from(roomUsers)
      .map((userId) => {
        const session = this.userSessions.get(userId);
        return session
          ? {
              userId,
              name: session.user.name,
              profileImage: session.user.profileImage,
              isOnline: session.isOnline,
              lastSeen: session.lastSeen,
            }
          : null;
      })
      .filter(Boolean);

    this.io.to(conversationId).emit("onlineUsers", {
      conversationId,
      onlineUsers,
    });
  }

  private sendOnlineUsersToSocket(
    socket: AuthenticatedSocket,
    conversationId: string
  ) {
    const roomUsers = this.roomParticipants.get(conversationId);
    if (!roomUsers) {
      socket.emit("onlineUsers", { conversationId, onlineUsers: [] });
      return;
    }

    const onlineUsers = Array.from(roomUsers)
      .map((userId) => {
        const session = this.userSessions.get(userId);
        return session
          ? {
              userId,
              name: session.user.name,
              profileImage: session.user.profileImage,
              isOnline: session.isOnline,
              lastSeen: session.lastSeen,
            }
          : null;
      })
      .filter(Boolean);

    socket.emit("onlineUsers", {
      conversationId,
      onlineUsers,
    });
  }

  // Public methods for external use
  public getIO(): SocketServer {
    return this.io;
  }

  public getUserSessions(): Map<string, UserSession> {
    return this.userSessions;
  }

  public getRoomParticipants(): Map<string, Set<string>> {
    return this.roomParticipants;
  }

  public isUserOnline(userId: string): boolean {
    return this.userSessions.has(userId);
  }

  public getUserSocketId(userId: string): string | undefined {
    return this.userSessions.get(userId)?.socketId;
  }

  public async notifyUser(
    userId: string,
    event: string,
    data: any
  ): Promise<void> {
    const session = this.userSessions.get(userId);
    if (session) {
      this.io.to(session.socketId).emit(event, data);
    }
  }

  public async notifyRoom(
    roomId: string,
    event: string,
    data: any
  ): Promise<void> {
    this.io.to(roomId).emit(event, data);
  }
}

export default SocketManager;
