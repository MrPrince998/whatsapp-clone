import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/users";

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: "JWT secret not configured",
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: string;
        email: string;
      };

      // Check if user exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Add user info to request
      req.userId = decoded.userId;
      req.user = user;

      next();
    } catch (jwtError) {
      res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: string;
        email: string;
      };
      const user = await User.findById(decoded.userId);

      if (user) {
        req.userId = decoded.userId;
        req.user = user;
      }
    } catch (jwtError) {
      // Token is invalid, but we continue without authentication
    }

    next();
  } catch (error) {
    console.error("Optional Auth Middleware Error:", error);
    next();
  }
};
