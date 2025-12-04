import SocketManager from "../socket/socketManager";

class SocketService {
  private socketManager: SocketManager | null = null;

  setSocketManager(manager: SocketManager) {
    this.socketManager = manager;
  }

  getSocketManager(): SocketManager | null {
    return this.socketManager;
  }

  // Notify user about new message
  async notifyNewMessage(userId: string, messageData: any): Promise<void> {
    if (!this.socketManager) return;

    await this.socketManager.notifyUser(userId, "newMessage", messageData);
  }

  // Notify conversation participants
  async notifyConversationUpdate(
    conversationId: string,
    updateData: any
  ): Promise<void> {
    if (!this.socketManager) return;

    await this.socketManager.notifyRoom(
      conversationId,
      "conversationUpdated",
      updateData
    );
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    if (!this.socketManager) return false;

    return this.socketManager.isUserOnline(userId);
  }

  // Get user's socket ID
  getUserSocketId(userId: string): string | undefined {
    if (!this.socketManager) return undefined;

    return this.socketManager.getUserSocketId(userId);
  }

  // Get online participants in room
  getOnlineParticipants(conversationId: string): string[] {
    if (!this.socketManager) return [];

    const roomParticipants = this.socketManager.getRoomParticipants();
    const participants = roomParticipants.get(conversationId);

    return participants ? Array.from(participants) : [];
  }
}

export default new SocketService();
