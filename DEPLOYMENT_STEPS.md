# 🚀 Step-by-Step Deployment Guide

This guide provides **exact steps** to deploy your application to **Render.com** (Backend) and **Vercel** (Frontend Apps).

---

## 📋 Prerequisites

- ✅ GitHub repository with your code
- ✅ Render.com account (free tier available)
- ✅ Vercel account (free tier available)
- ✅ MongoDB Atlas account (for database)
- ✅ Razorpay account (for payments)
- ✅ Cloudinary account (for file uploads)

---

## 🔧 Part 1: Backend Deployment (Render.com)

### Step 1: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `HybridFactoConsultancyApp`
5. Configure the service:
   - **Name:** `facto-backend-api` (or your preferred name)
   - **Region:** Choose closest to your users (e.g., `Singapore` or `Oregon`)
   - **Branch:** `main` (or your production branch)
   - **Root Directory:** `FactoBackendServices`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build-ts:prod`
   - **Start Command:** `npm run start:prod`
   - **Auto-Deploy:** `Yes` (deploys on every push to main branch)

### Step 2: Set Environment Variables in Render

1. In your Render service, go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add each variable one by one:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster

# Server Configuration
PORT=8080
NODE_ENV=production

# JWT Configuration (USE STRONG SECRET - Generate a random 32+ character string)
JWT_SECRET=your_production_jwt_secret_here_use_strong_random_string_min_32_chars
JWT_EXPIRES_IN=7d

# Payment Gateway - PRODUCTION KEYS (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_production_webhook_secret

# Cloudinary - PRODUCTION (Get from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your_production_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_production_cloudinary_api_key
CLOUDINARY_API_SECRET=your_production_cloudinary_api_secret

# File Upload
MAX_FILE_SIZE_MB=10

# SMS (Optional - Get from Twilio Dashboard)
TWILIO_ACCOUNT_SID=your_production_twilio_sid
TWILIO_AUTH_TOKEN=your_production_twilio_token
TWILIO_PHONE_NUMBER=your_production_twilio_number

# CORS - Add your Vercel domains after deployment
# Format: https://your-user-app.vercel.app,https://your-admin-app.vercel.app
# You'll update this after deploying frontend apps
CORS_ORIGIN=https://your-user-app.vercel.app,https://your-admin-app.vercel.app
```

**⚠️ Important Notes:**
- Replace all placeholder values with your actual production credentials
- Generate a strong `JWT_SECRET` (use: `openssl rand -base64 32` or online generator)
- Get Razorpay production keys from: https://dashboard.razorpay.com/app/keys
- Get Cloudinary credentials from: https://console.cloudinary.com/settings/api-keys
- **DO NOT** use test/development keys in production

### Step 3: Deploy Backend

1. Click **"Save Changes"** in Render
2. Render will automatically start building and deploying
3. Wait for deployment to complete (usually 3-5 minutes)
4. Note your backend URL: `https://facto-backend-api.onrender.com` (or your custom domain)

### Step 4: Verify Backend Deployment

1. Check deployment logs in Render dashboard
2. Test health endpoint: `https://your-backend-url.onrender.com/health` (if available)
3. Check logs for any errors

---

## 🌐 Part 2: Frontend Deployment (Vercel)

### Step 2.1: Deploy User Web App (FactoUserWebApp)

#### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `HybridFactoConsultancyApp`
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `FactoUserWebApp`
   - **Build Command:** `npm ci && npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

#### Step 2: Set Environment Variables

1. In project settings, go to **"Settings"** → **"Environment Variables"**
2. Add the following variable:

```env
VITE_API_URL=https://facto-backend-api.onrender.com/api/v1
```

3. Select environments: **Production**, **Preview**, and **Development**
4. Click **"Save"**

#### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment (usually 2-3 minutes)
3. Note your app URL: `https://your-user-app.vercel.app`

---

### Step 2.2: Deploy Admin App (FactoAdminApp)

#### Step 1: Create Vercel Project

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Import the same GitHub repository: `HybridFactoConsultancyApp`
3. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `FactoAdminApp`
   - **Build Command:** `npm ci && npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

#### Step 2: Set Environment Variables

1. Go to **"Settings"** → **"Environment Variables"**
2. Add:

```env
VITE_API_URL=https://facto-backend-api.onrender.com/api/v1
```

3. Select environments: **Production**, **Preview**, and **Development**
4. Click **"Save"**

#### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment
3. Note your admin app URL: `https://your-admin-app.vercel.app`

---

## 🔄 Part 3: Update CORS Configuration

After deploying both frontend apps, update the backend CORS to allow your Vercel domains:

### Step 1: Update Render Environment Variable

1. Go back to Render Dashboard
2. Open your backend service
3. Go to **"Environment"** tab
4. Find `CORS_ORIGIN` variable
5. Update it with your actual Vercel URLs:

```env
CORS_ORIGIN=https://your-user-app.vercel.app,https://your-admin-app.vercel.app
```

6. Click **"Save Changes"**
7. Render will automatically redeploy

### Step 2: Verify CORS

1. Open your user app in browser
2. Open browser console (F12)
3. Try to make an API call
4. Check for CORS errors - there should be none

---

## ✅ Part 4: Post-Deployment Verification

### Backend Verification

- [ ] Backend is accessible: `https://your-backend-url.onrender.com`
- [ ] Health endpoint works (if available)
- [ ] Database connection successful (check Render logs)
- [ ] No errors in Render logs

### Frontend Verification

- [ ] User Web App loads: `https://your-user-app.vercel.app`
- [ ] Admin App loads: `https://your-admin-app.vercel.app`
- [ ] API calls work (check browser console)
- [ ] No CORS errors
- [ ] Authentication works
- [ ] Payment gateway works (test with Razorpay test mode first)

### Test Checklist

- [ ] User can register/login
- [ ] User can view courses/services
- [ ] User can purchase course/service
- [ ] Payment flow works
- [ ] Admin can login
- [ ] Admin can manage content
- [ ] File uploads work (if applicable)

---

## 🔐 Security Checklist

- [ ] All production secrets are different from development
- [ ] JWT_SECRET is strong (32+ characters, random)
- [ ] Razorpay production keys are used (not test keys)
- [ ] CORS only allows your Vercel domains
- [ ] MongoDB connection string is secure
- [ ] No `.env` files are committed to Git
- [ ] Environment variables are set in platform dashboards (not in code)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Backend deployment fails
- **Solution:** Check Render logs for errors, verify build command is correct

**Problem:** Database connection fails
- **Solution:** Verify MongoDB URI is correct, check MongoDB Atlas network access allows Render IPs

**Problem:** CORS errors
- **Solution:** Update CORS_ORIGIN in Render with your Vercel domains

### Frontend Issues

**Problem:** Frontend can't connect to backend
- **Solution:** 
  1. Verify `VITE_API_URL` is set in Vercel dashboard
  2. Check backend is running
  3. Verify CORS allows your Vercel domain

**Problem:** API calls return 404
- **Solution:** Verify backend URL is correct, check API routes

**Problem:** Environment variables not working
- **Solution:** 
  1. Redeploy after adding environment variables
  2. Check variable name starts with `VITE_` for Vite apps
  3. Verify variables are set for correct environment (Production/Preview/Development)

---

## 📝 Quick Reference

### Backend URL
```
https://facto-backend-api.onrender.com/api/v1
```

### Environment Variables Locations

| Platform | Location |
|----------|----------|
| Render (Backend) | Dashboard → Service → Environment |
| Vercel (User App) | Dashboard → Project → Settings → Environment Variables |
| Vercel (Admin App) | Dashboard → Project → Settings → Environment Variables |

### Important URLs

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Razorpay Dashboard:** https://dashboard.razorpay.com
- **Cloudinary Dashboard:** https://console.cloudinary.com
- **MongoDB Atlas:** https://cloud.mongodb.com

---

## 🔄 Auto-Deployment

Both Render and Vercel support auto-deployment:

- **Render:** Automatically deploys when you push to the connected branch (usually `main`)
- **Vercel:** Automatically deploys on every push to `main` branch

To trigger a new deployment:
```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

---

## 📞 Support

If you encounter issues:
1. Check deployment logs in Render/Vercel dashboards
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure all credentials are production-ready (not test/development)

---

**Last Updated:** [Current Date]
**Status:** Ready for Production Deployment

