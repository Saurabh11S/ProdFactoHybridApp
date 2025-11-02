# Facto Backend Services

Backend API server for Facto Financial Services, built with Node.js, Express, TypeScript, and MongoDB.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 💳 **Payment Integration** - Razorpay payment gateway integration
- 📄 **Document Management** - Cloudinary integration for file uploads
- 📊 **Services Management** - CRUD operations for services and sub-services
- 📱 **Notifications** - User notification system
- 🎓 **Courses & Lectures** - Course management system
- 📝 **Blog Management** - Blog post system
- 💬 **Query & Consultation** - Customer query and consultation request handling
- 📈 **User Analytics** - User interaction and purchase tracking

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **File Storage**: Cloudinary
- **Payment**: Razorpay
- **SMS**: Twilio (optional)
- **Process Manager**: PM2

## Prerequisites

- Node.js 18+ installed
- MongoDB 6.0+ installed and running
- npm or yarn package manager
- Cloudinary account (for file uploads)
- Razorpay account (for payments)
- (Optional) Twilio account (for SMS)

## Installation

1. **Clone the repository and navigate to backend folder:**
   ```bash
   cd FactoBackendServices
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Setup](#environment-setup) below)

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/facto_app

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Cloudinary Configuration (Required for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cloudinary Folders (Optional)
CLOUDINARY_COURSE_THUMBNAILS_FOLDER=course_thumbnails
CLOUDINARY_COURSE_VIDEOS_FOLDER=course_videos
CLOUDINARY_BLOGS_FOLDER=blogs

# File Upload Configuration
MAX_FILE_SIZE_MB=10

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Getting API Keys

1. **Cloudinary**: Sign up at [cloudinary.com](https://cloudinary.com) → Dashboard → Product Environment Credentials
2. **Razorpay**: Login to [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys
3. **Twilio**: Sign up at [twilio.com](https://www.twilio.com) (optional)

## Development

### Start Development Server

```bash
npm start
```

This will start the server on `http://localhost:8080` with hot reload enabled.

### API Endpoints

The API is available at `http://localhost:8080/api/v1`

## Building for Production

### Build TypeScript to JavaScript

```bash
# For UAT
npm run build-ts

# For Production
npm run build-ts:prod
```

This compiles TypeScript files to the `dist/` directory.

### Available Build Commands

- `npm run build-ts` - Build for UAT with environment files
- `npm run build-ts:prod` - Build for production with environment files
- `npm run copy` - Copy config files for UAT
- `npm run copy:prod` - Copy config files for production

## Deployment

### Option 1: Using PM2 (Recommended)

1. **Build the project:**
   ```bash
   npm run build-ts:prod
   ```

2. **Start with PM2:**
   ```bash
   pm2 start pm2.config.prod.json
   ```

3. **Useful PM2 commands:**
   ```bash
   pm2 list              # List all processes
   pm2 logs             # View logs
   pm2 restart all      # Restart all processes
   pm2 stop all         # Stop all processes
   pm2 delete all       # Delete all processes
   ```

### Option 2: Direct Node.js

1. **Build the project:**
   ```bash
   npm run build-ts:prod
   ```

2. **Run the compiled code:**
   ```bash
   npm run start:prod
   ```

### Option 3: Docker Deployment (Coming Soon)

Docker configuration will be added in future updates.

## Environment Configuration Files

For production deployment, you need to create environment-specific files:

- `.env.uat` - For UAT environment
- `.env.prod` - For production environment

These files are automatically copied during the build process using the `copy` and `copy:prod` scripts.

## API Documentation

### Base URL

- **Development**: `http://localhost:8080/api/v1`
- **Production**: `https://your-production-domain.com/api/v1`

### Main Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /services` - Get all services
- `GET /sub-services/all` - Get all sub-services
- `POST /payment/create-order` - Create payment order
- `POST /payment/verify` - Verify payment
- `GET /courses` - Get all courses
- `GET /blogs` - Get all blogs

For complete API documentation, see the routes in `src/routes/v1/`

## Database Models

- User
- Service
- SubService
- Course & Lecture
- Blog
- PaymentOrder
- UserPurchase
- UserDocument
- ConsultationRequest
- Query
- Quotation

## Troubleshooting

### Build Errors

If you encounter TypeScript errors during build:

```bash
# Fix linting issues
npm run lint:fix

# Then rebuild
npm run build-ts:prod
```

### Port Already in Use

Change the PORT in `.env` file or kill the process using the port:

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check MONGODB_URI in `.env` file
- Verify network access to MongoDB server

### Payment Integration Issues

- Verify Razorpay keys are correct
- Check if using test/live keys in appropriate environment
- Ensure webhook secret matches Razorpay dashboard

## Available Scripts

- `npm start` - Start development server with hot reload
- `npm run start:uat` - Build and start for UAT
- `npm run start:prod` - Build and start for production
- `npm run build-ts` - Build TypeScript for UAT
- `npm run build-ts:prod` - Build TypeScript for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run tests

## License

This project is proprietary to Facto Financial Services.

## Support

For issues or questions, contact the development team or create an issue in the repository.




