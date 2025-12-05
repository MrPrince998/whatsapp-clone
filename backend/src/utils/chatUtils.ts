import { Conversation } from "../model/conversations";
import { Message } from "../model/messages";

export class ChatUtils {
  // Generate conversation name for 1-1 chats
  static generateConversationName(
    participants: any[],
    currentUserId: string
  ): string {
    if (participants.length === 2) {
      const otherUser = participants.find(
        (p) => p._id.toString() !== currentUserId
      );
      return otherUser?.name || "Unknown User";
    }
    return "Group Chat";
  }

  // Format conversation for response
  static formatConversationResponse(conversation: any, currentUserId: string) {
    const otherParticipants = conversation.participants.filter(
      (p: any) => p._id.toString() !== currentUserId
    );

    return {
      id: conversation._id,
      isGroup: conversation.isGroup,
      name: conversation.isGroup
        ? conversation.groupName
        : this.generateConversationName(
            conversation.participants,
            currentUserId
          ),
      description: conversation.groupDescription,
      image: conversation.isGroup
        ? conversation.groupImage
        : otherParticipants[0]?.profileImage || null,
      participants: conversation.participants,
      groupAdmin: conversation.groupAdmin,
      lastMessage: conversation.lastMessage,
      lastMessageTime: conversation.lastMessageTime,
      unreadCount: conversation.unreadCount || 0,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  // Format message for response
  static formatMessageResponse(message: any) {
    return {
      id: message._id,
      conversationId: message.conversationId,
      sender: message.sender,
      messageType: message.messageType,
      text: message.text,
      mediaUrl: message.mediaUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      repliedTo: message.repliedTo,
      forwardedFrom: message.forwardedFrom,
      status: message.status,
      deliveredTo: message.deliveredTo,
      seenBy: message.seenBy,
      editedAt: message.editedAt,
      deleted: message.deleted,
      deletedAt: message.deletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  // Check if user can perform action on conversation
  static async canUserAccessConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return false;

    return conversation.participants.some((p) => p.toString() === userId);
  }

  // Check if user is group admin
  static async isGroupAdmin(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) return false;

    return conversation.groupAdmin?.toString() === userId;
  }

  // Get online status of participants
  static getOnlineParticipants(participants: any[]): any[] {
    return participants.filter((p) => p.isOnline);
  }

  // Calculate message delivery statistics
  static calculateDeliveryStats(message: any, totalParticipants: number) {
    const deliveredCount = message.deliveredTo?.length || 0;
    const seenCount = message.seenBy?.length || 0;
    const pendingCount = Math.max(0, totalParticipants - 1 - deliveredCount); // -1 for sender

    return {
      delivered: deliveredCount,
      seen: seenCount,
      pending: pendingCount,
      total: totalParticipants - 1, // Exclude sender
    };
  }

  // Validate message content
  static validateMessageContent(
    messageType: string,
    text?: string,
    mediaUrl?: string
  ): { valid: boolean; error?: string } {
    switch (messageType) {
      case "text":
        if (!text || text.trim().length === 0) {
          return {
            valid: false,
            error: "Text content is required for text messages",
          };
        }
        if (text.length > 4096) {
          return {
            valid: false,
            error: "Message text is too long (max 4096 characters)",
          };
        }
        return { valid: true };

      case "image":
      case "video":
      case "audio":
      case "file":
        if (!mediaUrl) {
          return {
            valid: false,
            error: "Media URL is required for media messages",
          };
        }
        return { valid: true };

      default:
        return { valid: false, error: "Invalid message type" };
    }
  }

  // Generate typing indicator key
  static generateTypingKey(conversationId: string, userId: string): string {
    return `typing:${conversationId}:${userId}`;
  }

  // Format file size for display
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Get file extension from URL
  static getFileExtension(url: string): string {
    return url.split(".").pop()?.toLowerCase() || "";
  }

  // Check if file type is supported
  static isSupportedFileType(extension: string): boolean {
    const supportedExtensions = [
      // Images
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      // Videos
      "mp4",
      "avi",
      "mov",
      "wmv",
      "flv",
      // Audio
      "mp3",
      "wav",
      "ogg",
      "aac",
      // Documents
      "pdf",
      "doc",
      "docx",
      "txt",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
    ];

    return supportedExtensions.includes(extension);
  }

  // Generate message search index
  static generateSearchableText(message: any): string {
    let searchText = "";

    if (message.text) {
      searchText += message.text.toLowerCase() + " ";
    }

    if (message.fileName) {
      searchText += message.fileName.toLowerCase() + " ";
    }

    return searchText.trim();
  }

  // Check if message can be edited
  static canEditMessage(message: any, currentUserId: string): boolean {
    // Only sender can edit
    if (message.sender.toString() !== currentUserId) return false;

    // Only text messages can be edited
    if (message.messageType !== "text") return false;

    // Message must be less than 24 hours old
    const hoursSinceCreated =
      (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated > 24) return false;

    return true;
  }

  // Check if message can be deleted
  static canDeleteMessage(message: any, currentUserId: string): boolean {
    // Only sender can delete
    if (message.sender.toString() !== currentUserId) return false;

    return true;
  }

  // Check if message can be deleted for everyone
  static canDeleteForEveryone(message: any, currentUserId: string): boolean {
    if (!this.canDeleteMessage(message, currentUserId)) return false;

    // Message must be less than 1 hour old for delete for everyone
    const hoursSinceCreated =
      (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreated <= 1;
  }
}

export default ChatUtils;
