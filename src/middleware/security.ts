import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";

// Rate limiting configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // limit each IP to 2 OTP requests per minute
  message: {
    success: false,
    message: "Too many OTP requests, please wait before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const messageRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 messages per minute
  message: {
    success: false,
    message: "Too many messages, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const mediaUploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 file uploads per minute
  message: {
    success: false,
    message: "Too many file uploads, please wait before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per 15 minutes
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation rules
export const validateGenerateOTP = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),
];

export const validateVerifyOTP = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("otp")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits"),
];

export const validateResendOTP = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
];

export const validateSendMessage = [
  body("text")
    .optional()
    .trim()
    .isLength({ max: 4096 })
    .withMessage("Message text cannot exceed 4096 characters"),
  body("messageType")
    .optional()
    .isIn(["text", "image", "video", "audio", "file"])
    .withMessage("Invalid message type"),
  body("replyTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid reply message ID"),
];

export const validateCreateConversation = [
  body("participantIds")
    .isArray({ min: 1 })
    .withMessage("At least one participant is required")
    .custom((participantIds) => {
      if (!participantIds.every((id: string) => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error("All participant IDs must be valid MongoDB ObjectIds");
      }
      return true;
    }),
  body("conversationType")
    .isIn(["oneToOne", "group"])
    .withMessage("Conversation type must be either oneToOne or group"),
  body("groupName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Group name must be between 1 and 100 characters"),
];

export const validateAddParticipant = [
  body("userId").isMongoId().withMessage("Invalid user ID"),
];

// Input sanitization middleware
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Sanitize against NoSQL injection
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);

  // Sanitize against XSS
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === "string") {
      return xss(obj, {
        whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script"],
      });
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitizeObject(req.body);

  // Note: req.query is read-only in newer Express versions
  // Query parameters are typically handled by express-validator in route-specific validation
  // For now, we'll skip direct query sanitization to avoid the read-only error

  next();
};

// Validation result handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages: { [key: string]: string } = {};
    errors.array().forEach((error) => {
      if (error.type === "field") {
        errorMessages[error.path] = error.msg;
      }
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};
