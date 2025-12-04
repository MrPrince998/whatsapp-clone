import express, { Request, Response } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import connectDB from "./config/db";
import routes from "./routes";
import emailService from "./utils/emailService";
import SocketManager from "./socket/socketManager";
import socketService from "./services/socketService";
import CleanupService from "./services/cleanupService";
import { generalRateLimit, sanitizeInput } from "./middleware/security";
import { swaggerSpec, swaggerUi } from "./config/swagger";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["http://localhost:3000", "http://localhost:3001"] // Add your frontend URLs
        : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

// Rate limiting
app.use(generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Input sanitization
app.use(sanitizeInput);

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "WhatsApp Clone API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  })
);

// Swagger JSON endpoint
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Initialize Socket.IO
const socketManager = new SocketManager(httpServer);

// Initialize socket service
socketService.setSocketManager(socketManager);

// Make socketManager available to controllers
app.set("socketManager", socketManager);

// Connect to database
connectDB();

// Initialize cleanup service
const cleanupService = CleanupService.getInstance();
cleanupService.start();

// Initialize email service configuration on startup
emailService
  .verifyConnection()
  .then(() => {
    console.log("Email service initialization completed");
  })
  .catch(() => {
    console.log(
      "Continuing without email service - OTPs will be logged to console"
    );
  });

// Routes
app.use("/api", routes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "WhatsApp Clone Server is running!",
    endpoints: {
      health: "/api/health",
      generateOTP: "POST /api/auth/generate-otp",
      verifyOTP: "POST /api/auth/verify-otp",
      resendOTP: "POST /api/auth/resend-otp",
      logout: "POST /api/auth/logout (requires auth)",
      profile: "GET /api/auth/profile (requires auth)",
    },
  });
});

// Global error handler
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error("Global error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: error.message }),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log(`Socket.IO server ready for real-time communication`);
});
