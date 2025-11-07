# Local Development Setup Guide

This guide will help you run the Facto Consultancy Application locally on your machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - OR use **MongoDB Atlas** (cloud database) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Step-by-Step Setup

### Step 1: Clone/Verify Repository

```bash
# Navigate to your project directory
cd FactoConsultancyApp
```

### Step 2: Setup Backend Services

#### 2.1 Install Dependencies

```bash
cd FactoBackendServices
npm install
```

#### 2.2 Create Environment File

Create a `.env` file in the `FactoBackendServices` directory:

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Or use your text editor to create .env file
```

Add the following content to `.env`:

```env
# Database Configuration
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/facto_app

# Option 2: MongoDB Atlas (Cloud - Recommended)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/facto_app?retryWrites=true&w=majority

# Razorpay Configuration (Test Keys)
RAZORPAY_KEY_ID=rzp_test_RH6v2Ap0TDGOmM
RAZORPAY_KEY_SECRET=qWBWyBxMQbjo10g2t8CVMv5h
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=8080
NODE_ENV=development

# Twilio Configuration (Optional - for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Cloudinary Configuration (Required for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Important Notes:**
- Replace MongoDB URI with your actual connection string
- Get Razorpay keys from [Razorpay Dashboard](https://dashboard.razorpay.com/)
- Get Cloudinary credentials from [Cloudinary Dashboard](https://cloudinary.com/console)
- Use a strong JWT_SECRET for security

#### 2.3 Start MongoDB (if using local MongoDB)

```bash
# Windows (if installed as service, it should start automatically)
# Or start MongoDB service:
net start MongoDB

# macOS/Linux
mongod --dbpath ~/data/db
```

#### 2.4 Start Backend Server

```bash
cd FactoBackendServices
npm start
```

The backend server will start on **http://localhost:8080**

You should see:
```
✅ Server is running on port 8080
✅ Database connected successfully
```

### Step 3: Setup User Web App

#### 3.1 Install Dependencies

Open a **new terminal window** and run:

```bash
cd FactoUserWebApp
npm install
```

#### 3.2 Create Environment File (Optional)

Create a `.env` file in the `FactoUserWebApp` directory:

```env
# Backend API URL (for local development)
VITE_API_URL=http://localhost:8080/api/v1

# Razorpay Configuration (Test Key)
VITE_RAZORPAY_KEY_ID=rzp_test_RH6v2Ap0TDGOmM
```

**Note:** If you don't create this file, the app will use the production URL by default. For local development, create this file.

#### 3.3 Start User Web App

```bash
cd FactoUserWebApp
npm run dev
```

The app will start on **http://localhost:3000** (configured in vite.config.ts)

### Step 4: Setup Admin App (Optional)

#### 4.1 Install Dependencies

Open a **new terminal window** and run:

```bash
cd FactoAdminApp
npm install
```

#### 4.2 Update API Configuration

Edit `FactoAdminApp/src/utils/apiConstants.ts`:

```typescript
export const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:8080/api/v1'; // Local development
```

Or create a `.env` file:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

#### 4.3 Start Admin App

```bash
cd FactoAdminApp
npm run dev
```

The admin app will start on **http://localhost:5173** (default Vite port, or next available)

## 🎯 Running All Services

You need **3 terminal windows** to run everything:

### Terminal 1 - Backend
```bash
cd FactoBackendServices
npm start
```

### Terminal 2 - User Web App
```bash
cd FactoUserWebApp
npm run dev
```

### Terminal 3 - Admin App (Optional)
```bash
cd FactoAdminApp
npm run dev
```

## 📍 Access Points

Once all services are running:

- **Backend API**: http://localhost:8080
- **Backend Health Check**: http://localhost:8080/api/v1
- **User Web App**: http://localhost:3000
- **Admin App**: http://localhost:5173 (or check terminal for actual port)

## 🔧 Configuration Summary

### Backend Configuration
- **Port**: 8080
- **Database**: MongoDB (local or Atlas)
- **API Base**: `/api/v1`

### Frontend Configuration
- **User App**: Port 3000 (configured in vite.config.ts)
- **Admin App**: Port 5173 (default Vite port)
- **API URL**: `http://localhost:8080/api/v1`

## ✅ Verification Steps

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:8080/api/v1
   # Should return: {"uptime":..., "message":"Shivam's API health check :: GOOD"}
   ```

2. **Check Frontend:**
   - Open browser to http://localhost:3000 (User App) or http://localhost:5173 (Admin App)
   - Check browser console for API URL: `🌐 API Base URL: http://localhost:8080/api/v1`

3. **Test API Connection:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Navigate to Services page
   - Check if API calls are going to `localhost:8080`

## 🐛 Troubleshooting

### Backend Issues

**Problem: Port 8080 already in use**
```bash
# Windows - Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8080 | xargs kill
```

**Problem: MongoDB connection failed**
- Check if MongoDB is running
- Verify MongoDB URI in `.env`
- Check MongoDB logs for errors

**Problem: Module not found errors**
```bash
cd FactoBackendServices
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Problem: API calls failing**
- Check if backend is running on port 8080
- Verify API URL in `apiConfig.ts` or `.env`
- Check CORS settings in backend
- Check browser console for errors

**Problem: Port already in use**
- Vite will automatically use next available port
- Check terminal output for actual port number

**Problem: Build errors**
```bash
cd FactoUserWebApp  # or FactoAdminApp
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Common Fixes

**Clear cache and reinstall:**
```bash
# Backend
cd FactoBackendServices
rm -rf node_modules package-lock.json
npm install

# Frontend
cd FactoUserWebApp
rm -rf node_modules package-lock.json
npm install
```

**Check environment variables:**
- Ensure `.env` files are in correct directories
- Restart dev servers after creating/modifying `.env` files
- Check variable names (case-sensitive)

## 📝 Development Workflow

1. **Start Backend first** (Terminal 1)
2. **Wait for backend to fully start** (see "Database connected" message)
3. **Start Frontend apps** (Terminal 2 & 3)
4. **Make code changes** - Hot reload should work automatically
5. **Check browser console** for any errors

## 🔐 Security Notes

- Never commit `.env` files to git
- Use test Razorpay keys for development
- Use strong JWT_SECRET in production
- Don't expose production credentials

## 📚 Additional Resources

- **Backend README**: `FactoBackendServices/README.md`
- **Admin App README**: `FactoAdminApp/README.md`
- **User App README**: `FactoUserWebApp/README.md`
- **Environment Setup**: `FactoBackendServices/ENVIRONMENT_SETUP.md`

## 🎉 You're All Set!

Once all services are running, you can:
- Access the user web app and browse services
- Access the admin app to manage content
- Make API calls and see them in backend logs
- Develop and test new features locally

Happy coding! 🚀

