import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WhatsApp Clone API",
      version: "1.0.0",
      description:
        "A comprehensive WhatsApp clone backend API with real-time messaging, media handling, and security features",
      contact: {
        name: "WhatsApp Clone Team",
        email: "support@whatsappclone.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
      {
        url: "https://api.whatsappclone.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User unique identifier",
            },
            phone: {
              type: "string",
              description: "User phone number",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            username: {
              type: "string",
              description: "User display name",
            },
            profilePicture: {
              type: "string",
              description: "URL to user's profile picture",
            },
            isOnline: {
              type: "boolean",
              description: "User online status",
            },
            lastSeen: {
              type: "string",
              format: "date-time",
              description: "Last seen timestamp",
            },
          },
        },
        Message: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Message unique identifier",
            },
            content: {
              type: "string",
              description: "Message text content",
            },
            sender: {
              type: "string",
              description: "Sender user ID",
            },
            conversation: {
              type: "string",
              description: "Conversation ID",
            },
            messageType: {
              type: "string",
              enum: ["text", "image", "video", "audio", "file"],
              description: "Type of message",
            },
            mediaUrl: {
              type: "string",
              description: "URL to media file if applicable",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Message timestamp",
            },
            readBy: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user: { type: "string" },
                  readAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        Conversation: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Conversation unique identifier",
            },
            type: {
              type: "string",
              enum: ["direct", "group"],
              description: "Conversation type",
            },
            participants: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of participant user IDs",
            },
            groupName: {
              type: "string",
              description: "Group name (for group conversations)",
            },
            groupPicture: {
              type: "string",
              description: "Group picture URL",
            },
            lastMessage: {
              type: "string",
              description: "Last message ID",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
            status: {
              type: "number",
              description: "HTTP status code",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Validation errors array",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "../docs/*.yaml")],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
