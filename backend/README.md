# WhatsApp Clone Backend API

A comprehensive WhatsApp clone backend built with Node.js, Express, TypeScript, MongoDB, and Socket.IO. Features real-time messaging, media handling, security middleware, and comprehensive API documentation.

## 🚀 Features

### Core Functionality

- **Real-time Messaging** - Socket.IO powered instant messaging
- **User Authentication** - OTP-based phone verification with JWT
- **Media Handling** - Local file storage with categorization (images, videos, audio, documents)
- **Conversation Management** - Direct chats and group conversations
- **Message Status** - Read receipts and delivery status
- **Online Status** - Real-time user presence tracking

### Security Features

- **Rate Limiting** - Multi-tier rate limiting for different endpoints
- **Input Validation** - Comprehensive validation using express-validator
- **Security Headers** - Helmet.js for security headers
- **Input Sanitization** - XSS and NoSQL injection protection
- **CORS Configuration** - Proper cross-origin resource sharing setup

### Advanced Features

- **Automated Cleanup** - Scheduled cleanup of expired OTPs and unused files
- **API Documentation** - Interactive Swagger/OpenAPI 3.0 documentation
- **File Management** - Upload, download, delete, and metadata APIs
- **Database Optimization** - MongoDB with proper indexing and relationships

## 🛠 Tech Stack

- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT + OTP verification
- **File Upload**: Multer with local storage
- **Security**: Helmet, CORS, Rate Limiting, Input Validation
- **Documentation**: Swagger/OpenAPI 3.0
- **Email**: Nodemailer (optional)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MrPrince998/whatsapp-clone.git
cd whatsapp-clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, set your MongoDB URI and JWT secret
```

### 4. Start the Server

```bash
# Development with hot reload
npm run dev

# Production build
npm run build
npm start
```

### 5. Access the Application

- **Server**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/api/health

## 📚 API Documentation

### Interactive Documentation

Visit [http://localhost:5000/api-docs](http://localhost:5000/api-docs) for comprehensive interactive API documentation with:

- **Authentication support** - Test protected endpoints
- **Request/Response examples** - Complete examples for all endpoints
- **Schema validation** - Input/output data structures
- **Rate limiting info** - API usage limits

### Quick API Overview

#### Authentication

```
POST /api/auth/generate-otp    # Generate OTP for phone verification
POST /api/auth/verify-otp      # Verify OTP and get JWT token
GET  /api/auth/me              # Get current user profile
```

#### Messages

```
POST /api/messages/send                    # Send a message
GET  /api/messages/:conversationId         # Get conversation messages
PUT  /api/messages/:messageId/read         # Mark message as read
```

#### Conversations

```
GET  /api/conversations                    # Get user conversations
POST /api/conversations                    # Create new conversation
GET  /api/conversations/:id                # Get conversation details
POST /api/conversations/:id/participants   # Add participants
```

#### Media

```
POST   /api/media/upload                   # Upload file
GET    /api/media/files/:category/:filename # Download file
DELETE /api/media/files/:category/:filename # Delete file
GET    /api/media/info/:category/:filename  # File information
```

## 🔐 Security Features

### Rate Limiting

- **OTP Generation**: 5 requests per 15 minutes per IP
- **Authentication**: 10 requests per 15 minutes per IP
- **Messages**: 100 requests per 15 minutes per user
- **File Uploads**: 10 uploads per hour per user

### Input Protection

- XSS protection with sanitization
- NoSQL injection prevention
- File type and size validation
- Request body size limits

### Security Headers

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── db.ts         # Database connection
│   ├── multer.ts     # File upload configuration
│   └── swagger.ts    # API documentation config
├── controller/       # Route controllers
│   ├── authController.ts
│   ├── messageController.ts
│   ├── conversationController.ts
│   └── mediaController.ts
├── middleware/       # Custom middleware
│   ├── auth.ts       # JWT authentication
│   ├── security.ts   # Rate limiting & validation
│   └── socketAuth.ts # Socket authentication
├── model/           # Database models
│   ├── users.ts
│   ├── messages.ts
│   └── conversations.ts
├── routes/          # API routes
│   ├── authRoutes.ts
│   ├── messageRoutes.ts
│   ├── conversationRoutes.ts
│   └── mediaRoutes.ts
├── services/        # Business logic services
│   ├── cleanupService.ts
│   └── socketService.ts
├── socket/          # Socket.IO management
│   └── socketManager.ts
├── utils/           # Utility functions
│   └── emailService.ts
└── docs/            # API documentation
    ├── auth.yaml
    ├── messages.yaml
    ├── conversations.yaml
    └── media.yaml
```

## 🔧 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/whatsapp_clone

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads
```

## 🧪 Testing the API

### 1. Authentication Flow

```bash
# Generate OTP
curl -X POST http://localhost:5000/api/auth/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Verify OTP (check console for OTP if email not configured)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

### 2. Send a Message

```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "CONVERSATION_ID", "content": "Hello World!"}'
```

### 3. Upload Media

```bash
curl -X POST http://localhost:5000/api/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

## 📊 Monitoring & Cleanup

### Automated Cleanup

- **Daily OTP cleanup** at 2:00 AM
- **Weekly unused file cleanup**
- **Manual cleanup endpoints** available

### Health Monitoring

- Health check endpoint: `/api/health`
- Server status and endpoint overview
- Documentation links

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 Development Notes

### Adding New Endpoints

1. Create controller method
2. Add route definition
3. Update Swagger documentation in `/src/docs/`
4. Add validation middleware if needed

### Database Changes

1. Update Mongoose models
2. Consider migration scripts for existing data
3. Update API documentation

### Security Updates

1. Review rate limiting configurations
2. Update validation rules as needed
3. Test security middleware

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [Swagger UI](http://localhost:5000/api-docs)
- **Issues**: [GitHub Issues](https://github.com/MrPrince998/whatsapp-clone/issues)
- **Email**: Support available through GitHub issues

## 🎯 Roadmap

- [ ] Push notifications
- [ ] Message encryption
- [ ] Voice/video calling
- [ ] Message reactions
- [ ] User blocking/reporting
- [ ] Admin dashboard
- [ ] Message forwarding
- [ ] Group admin controls

---

**Built with ❤️ for real-time communication**
