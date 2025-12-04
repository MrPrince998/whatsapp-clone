import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { User } from "../model/users";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: any
) => {
  try {
    // Get token from auth object or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new Error("JWT secret not configured"));
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: string;
        email: string;
      };

      // Check if user exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user info to socket
      socket.userId = decoded.userId;
      socket.user = user;

      console.log(
        `Socket authenticated for user: ${user.name} (${user.email})`
      );
      next();
    } catch (jwtError) {
      return next(new Error("Invalid or expired token"));
    }
  } catch (error) {
    console.error("Socket auth error:", error);
    next(new Error("Authentication failed"));
  }
};
