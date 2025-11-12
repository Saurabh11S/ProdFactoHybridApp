# 🚀 Production Deployment Guide - Configuration Management

## 📋 Overview

This guide provides comprehensive instructions for managing **separate configurations** for **localhost (development)** and **production (deployment)** environments. The project uses:

- **Render.com** for `FactoBackendServices` (Backend API)
- **Vercel** for `FactoUserWebApp` (User Web App)
- **Vercel** for `FactoAdminApp` (Admin Dashboard)

---

## 🎯 Configuration Strategy

### Core Principle
**NEVER mix localhost and production configurations.** Each environment should have its own isolated configuration to prevent accidental production deployments with development settings.

### Configuration Separation Approach

1. **Environment Variables** - Use platform-specific environment variable management
2. **Configuration Files** - Keep local `.env` files for development only
3. **Build-time Detection** - Use environment detection in code to switch configurations
4. **Platform Settings** - Configure production settings directly in deployment platforms

---

## 📁 Current Configuration Structure

```
HybridFactoConsultancyApp/
├── .env                          # ❌ REMOVE - Root .env (causes confusion)
├── FactoBackendServices/
│   ├── .env                      # ✅ LOCAL ONLY - For localhost development
│   └── src/
│       ├── app.ts                # Backend configuration
│       └── config/
│           └── db.ts             # Database configuration
├── FactoUserWebApp/
│   ├── src/
│   │   └── config/
│   │       └── apiConfig.ts      # API URL configuration
│   └── vercel.json               # ✅ PROD - Vercel deployment config
└── FactoAdminApp/
    ├── src/
    │   └── utils/
    │       └── apiConstants.ts   # API URL configuration
    └── vercel.json               # ✅ PROD - Vercel deployment config
```

---

## 🔧 Backend Configuration (FactoBackendServices)

### For Localhost Development

**Location:** `FactoBackendServices/.env` (DO NOT commit to git)

```env
# MongoDB Connection - Use production DB for consistency OR local DB for testing
MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_local_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Payment Gateway (Test Mode)
RAZORPAY_KEY_ID=your_test_razorpay_key
RAZORPAY_KEY_SECRET=your_test_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_test_webhook_secret

# Cloudinary (Development)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# File Upload
MAX_FILE_SIZE_MB=10

# SMS (Optional - Development)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# CORS (Localhost - Allow all local ports)
CORS_ORIGIN=*
```

**To run locally:**
```bash
cd FactoBackendServices
npm install
npm start  # Uses .env file automatically
```

### For Production (Render.com)

**Location:** Render.com Dashboard → Your Service → Environment Variables

**DO NOT** create a `.env` file in production. Render uses environment variables set in the dashboard.

#### Step 1: Create/Update Render Service

1. Go to [Render.com Dashboard](https://dashboard.render.com)
2. Select your backend service (`facto-backend-api`) or create a new one
3. Navigate to **Environment** tab

#### Step 2: Set Environment Variables

Add/Update these environment variables in Render:

```env
# MongoDB Connection - PRODUCTION DATABASE
MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster

# Server Configuration
PORT=8080
NODE_ENV=production

# JWT Configuration - USE STRONG SECRET IN PRODUCTION
JWT_SECRET=your_production_jwt_secret_here_use_strong_random_string
JWT_EXPIRES_IN=7d

# Payment Gateway - PRODUCTION KEYS
RAZORPAY_KEY_ID=your_production_razorpay_key
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_production_webhook_secret

# Cloudinary - PRODUCTION
CLOUDINARY_CLOUD_NAME=your_production_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_production_cloudinary_api_key
CLOUDINARY_API_SECRET=your_production_cloudinary_api_secret

# File Upload
MAX_FILE_SIZE_MB=10

# SMS (Optional - Production)
TWILIO_ACCOUNT_SID=your_production_twilio_sid
TWILIO_AUTH_TOKEN=your_production_twilio_token
TWILIO_PHONE_NUMBER=your_production_twilio_number

# CORS - Production domains only
CORS_ORIGIN=https://your-user-app.vercel.app,https://your-admin-app.vercel.app
```

#### Step 3: Configure Build & Start Commands

In Render service settings:

- **Build Command:** `npm install && npm run build-ts:prod`
- **Start Command:** `npm run start:prod`
- **Root Directory:** `FactoBackendServices`

#### Step 4: CORS Configuration for Production

Update `FactoBackendServices/src/app.ts` to detect environment:

```typescript
const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        // Production domains only
        process.env.CORS_ORIGIN?.split(',') || [],
        /^https:\/\/.*\.vercel\.app$/,
      ].flat()
    : [
        // Development - allow all localhost
        /^http:\/\/localhost:\d+$/,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
  // ... rest of config
};
```

---

## 🌐 Frontend Configuration (FactoUserWebApp & FactoAdminApp)

### For Localhost Development

**Option 1: Use Root `.env` file (Recommended for localhost)**

Create `.env` in the **root directory** (not in app folders):

```env
# Backend API URL - LOCALHOST
VITE_API_URL=http://localhost:8080/api/v1

# Environment
NODE_ENV=development
```

**Option 2: Use Local Backend with Production Database**

If you want to test with production data but run backend locally:

```env
# Backend API URL - LOCALHOST (backend runs locally, connects to prod DB)
VITE_API_URL=http://localhost:8080/api/v1
```

**To run locally:**
```bash
# Terminal 1: Start Backend
cd FactoBackendServices
npm start

# Terminal 2: Start User Web App
cd FactoUserWebApp
npm run dev

# Terminal 3: Start Admin App
cd FactoAdminApp
npm run dev
```

### For Production (Vercel)

**DO NOT** rely on `.env` files for production. Vercel uses environment variables set in the dashboard.

#### Step 1: Configure Vercel Environment Variables

For **FactoUserWebApp:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **User Web App** project
3. Go to **Settings** → **Environment Variables**
4. Add:

```env
VITE_API_URL=https://facto-backend-api.onrender.com/api/v1
```

5. Set for: **Production**, **Preview**, and **Development** environments

For **FactoAdminApp:**

1. Select your **Admin App** project
2. Go to **Settings** → **Environment Variables**
3. Add:

```env
VITE_API_URL=https://facto-backend-api.onrender.com/api/v1
```

4. Set for: **Production**, **Preview**, and **Development** environments

#### Step 2: Update vercel.json (Optional - Backup)

The `vercel.json` files already have environment variables, but Vercel dashboard settings take precedence:

**FactoUserWebApp/vercel.json:**
```json
{
  "version": 2,
  "buildCommand": "cd FactoUserWebApp && npm ci && npm run build",
  "outputDirectory": "FactoUserWebApp/dist",
  "framework": "vite",
  "installCommand": "cd FactoUserWebApp && npm install",
  "rootDirectory": "FactoUserWebApp",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://facto-backend-api.onrender.com/api/v1"
  }
}
```

**FactoAdminApp/vercel.json:**
```json
{
  "version": 2,
  "buildCommand": "npm ci && npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://facto-backend-api.onrender.com/api/v1"
  }
}
```

#### Step 3: Update API Configuration Files

Ensure the configuration files detect environment correctly:

**FactoUserWebApp/src/config/apiConfig.ts:**
```typescript
import { Capacitor } from '@capacitor/core';

const getApiBaseUrl = (): string => {
  // Priority 1: Environment variable (from Vercel or .env)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Detect if running on Vercel (production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      return 'https://facto-backend-api.onrender.com/api/v1';
    }
  }
  
  // Priority 3: Default to localhost for local development
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
```

**FactoAdminApp/src/utils/apiConstants.ts:**
```typescript
const getApiBaseUrl = (): string => {
  // Priority 1: Environment variable (from Vercel or .env)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Detect if running on Vercel (production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      return 'https://facto-backend-api.onrender.com/api/v1';
    }
  }
  
  // Priority 3: Default to localhost for local development
  return 'http://localhost:8080/api/v1';
};

export const BASE_URL = getApiBaseUrl();
```

---

## 🔐 Security Best Practices

### 1. Never Commit `.env` Files

Ensure `.gitignore` includes:
```
.env
.env.local
.env.production
.env.development
*.env
```

### 2. Use Different Secrets for Production

- **JWT_SECRET**: Use a strong, randomly generated string (minimum 32 characters)
- **Database Passwords**: Never reuse development passwords
- **API Keys**: Use production keys from respective services

### 3. Environment Variable Naming

- **Backend**: Use standard names (e.g., `MONGODB_URI`, `PORT`)
- **Frontend**: Use `VITE_` prefix for Vite to expose them (e.g., `VITE_API_URL`)

### 4. Rotate Secrets Regularly

- Change production secrets periodically
- Update all environments when rotating

---

## 📝 Configuration Checklist

### Pre-Deployment

- [ ] Remove root `.env` file (if exists) to avoid confusion
- [ ] Verify `.gitignore` excludes all `.env` files
- [ ] Document all required environment variables
- [ ] Test localhost configuration works
- [ ] Verify production environment variables are set in platforms

### Backend (Render.com)

- [ ] Create/Update Render service
- [ ] Set all environment variables in Render dashboard
- [ ] Configure build and start commands
- [ ] Update CORS to allow production frontend domains
- [ ] Test backend health endpoint
- [ ] Verify database connection

### Frontend (Vercel)

- [ ] Set `VITE_API_URL` in Vercel dashboard for User Web App
- [ ] Set `VITE_API_URL` in Vercel dashboard for Admin App
- [ ] Verify `vercel.json` files are correct
- [ ] Update API configuration files to detect environment
- [ ] Test production builds locally
- [ ] Deploy and verify API calls work

### Post-Deployment

- [ ] Test all API endpoints from production frontend
- [ ] Verify CORS is working correctly
- [ ] Check browser console for errors
- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Monitor logs for errors

---

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend

**Symptoms:**
- CORS errors in browser console
- 404 errors on API calls
- Network errors

**Solutions:**

1. **Check API URL:**
   ```javascript
   // In browser console
   console.log('API URL:', import.meta.env.VITE_API_URL);
   ```

2. **Verify Vercel Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure `VITE_API_URL` is set for all environments
   - Redeploy after adding variables

3. **Check Backend CORS:**
   - Verify backend CORS allows your Vercel domain
   - Check Render logs for CORS errors

4. **Verify Backend is Running:**
   - Check Render dashboard for service status
   - Test backend health endpoint: `https://facto-backend-api.onrender.com/health`

### Issue: Backend can't connect to database

**Symptoms:**
- Database connection errors in logs
- 500 errors on API calls

**Solutions:**

1. **Verify MongoDB URI:**
   - Check Render environment variables
   - Ensure connection string includes database name: `/facto_app`
   - Verify credentials are correct

2. **Check MongoDB Atlas Network Access:**
   - Ensure `0.0.0.0/0` is allowed (or Render IPs)
   - Verify database user has correct permissions

3. **Test Connection:**
   ```bash
   cd FactoBackendServices
   npm run verify:db
   ```

### Issue: Localhost uses production config

**Symptoms:**
- Local app connects to production backend
- Can't use local backend

**Solutions:**

1. **Check Root `.env` File:**
   ```bash
   # Should have localhost URL
   VITE_API_URL=http://localhost:8080/api/v1
   ```

2. **Verify Backend is Running:**
   ```bash
   cd FactoBackendServices
   npm start
   ```

3. **Clear Vite Cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Issue: Production uses localhost config

**Symptoms:**
- Production app tries to connect to `localhost:8080`
- API calls fail

**Solutions:**

1. **Verify Vercel Environment Variables:**
   - Go to Vercel Dashboard
   - Check `VITE_API_URL` is set correctly
   - Ensure it's set for **Production** environment

2. **Redeploy:**
   - Environment variables require redeployment
   - Trigger a new deployment after adding variables

3. **Check Build Logs:**
   - Verify `VITE_API_URL` is present during build
   - Check for any build-time errors

---

## 🔄 Workflow: Switching Between Localhost and Production

### For Local Development

1. **Start Backend Locally:**
   ```bash
   cd FactoBackendServices
   # Ensure .env file exists with localhost config
   npm start
   ```

2. **Start Frontend Apps:**
   ```bash
   # Ensure root .env has: VITE_API_URL=http://localhost:8080/api/v1
   cd FactoUserWebApp
   npm run dev
   
   cd FactoAdminApp
   npm run dev
   ```

### For Production Testing

1. **Use Production Backend:**
   - Update root `.env`: `VITE_API_URL=https://facto-backend-api.onrender.com/api/v1`
   - Start frontend apps locally
   - They will connect to production backend

2. **Deploy to Production:**
   - Push code to GitHub
   - Vercel auto-deploys (uses dashboard environment variables)
   - Render auto-deploys (uses dashboard environment variables)

---

## 📊 Configuration Summary

### Localhost Configuration

| Component | Location | Value |
|-----------|----------|-------|
| Backend API URL | Root `.env` | `http://localhost:8080/api/v1` |
| Backend Port | `FactoBackendServices/.env` | `8080` |
| MongoDB URI | `FactoBackendServices/.env` | Production DB (or local) |
| NODE_ENV | `FactoBackendServices/.env` | `development` |

### Production Configuration

| Component | Location | Value |
|-----------|----------|-------|
| Backend API URL | Vercel Dashboard | `https://facto-backend-api.onrender.com/api/v1` |
| Backend Port | Render Dashboard | `8080` (or auto) |
| MongoDB URI | Render Dashboard | Production DB connection string |
| NODE_ENV | Render Dashboard | `production` |

---

## 🎓 Additional Resources

- [Render.com Documentation](https://render.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [MongoDB Atlas Connection](https://www.mongodb.com/docs/atlas/connect-to-cluster/)

---

## ⚠️ Important Notes

1. **Never commit `.env` files** - They contain sensitive information
2. **Always test locally first** - Verify configuration before deploying
3. **Use different secrets** - Production and development must use different credentials
4. **Monitor logs** - Check Render and Vercel logs for configuration issues
5. **Document changes** - Keep this guide updated when configuration changes

---

## 🚀 Quick Reference Commands

### Local Development
```bash
# Backend
cd FactoBackendServices && npm start

# User Web App
cd FactoUserWebApp && npm run dev

# Admin App
cd FactoAdminApp && npm run dev
```

### Production Build
```bash
# Backend
cd FactoBackendServices && npm run build-ts:prod

# User Web App
cd FactoUserWebApp && npm run build

# Admin App
cd FactoAdminApp && npm run build
```

### Verify Configuration
```bash
# Check backend database connection
cd FactoBackendServices && npm run verify:db

# Check environment variables (local)
# Backend: Check FactoBackendServices/.env
# Frontend: Check root .env
```

---

**Last Updated:** [Current Date]
**Maintained By:** Development Team

