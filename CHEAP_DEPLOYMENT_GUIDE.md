# Cheap Cloud Deployment Guide for Facto App

This guide will help you deploy the complete Facto application to the cloud using **FREE TIER** services, saving you money while getting your app online.

## 📊 Deployment Architecture

```
┌─────────────────┐
│   User App      │ → Netlify/Vercel (FREE)
│  (React/Vite)   │
└─────────────────┘

┌─────────────────┐
│   Admin App     │ → Netlify/Vercel (FREE)
│  (React/Vite)   │
└─────────────────┘

┌─────────────────┐
│   Backend API   │ → Render.com (FREE)
│ (Node/Express)  │
└─────────────────┘
        ↓
┌─────────────────┐
│   MongoDB       │ → MongoDB Atlas (FREE)
│   Database      │
└─────────────────┘
```

**Total Cost: $0/month** ✅ (as long as you stay within free tier limits)

---

## 🆓 Step-by-Step Deployment

### Phase 1: MongoDB Database (FREE)

#### Option 1: MongoDB Atlas (Recommended - 512MB Free Forever)

1. **Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**
   - Click "Try Free"
   - Create account with Google

2. **Create a Free Cluster:**
   - Click "Build a Database"
   - Select **"M0 Free"** (Forever Free)
   - Choose a Cloud Provider (AWS)
   - Select your preferred region (closest to your users)
   - Name: `facto-cluster`
   - Click "Create"

3. **Create Database User:**
   - Username: `facto-admin`
   - Password: Generate a strong password (save it!)
   - Click "Create User"

4. **Set Network Access:**
   - Click "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String:**
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://facto-admin:YOUR_PASSWORD@facto-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=facto-cluster`

6. **Add Database Name:**
   - Add `/facto_app` at the end before the query string
   - Final string: `mongodb+srv://facto-admin:YOUR_PASSWORD@facto-cluster.xxxxx.mongodb.net/facto_app?retryWrites=true&w=majority`

✅ **Save this connection string!** You'll need it for backend deployment.

#### Option 2: Render.com MongoDB (Alternative - $7/month after free trial)

If you prefer having everything on Render:

1. Create MongoDB service on Render
2. Choose "Free" plan (limited to 90 days)
3. Pay $7/month after trial

> **Recommendation**: Use MongoDB Atlas M0 (Free forever)

---

### Phase 2: Backend API Deployment (FREE)

#### Recommended: Render.com

**Free Tier Benefits:**
- Free forever for web services
- Automatic HTTPS
- Free SSL certificate
- 750 hours/month compute time
- 100GB bandwidth/month
- Sleeps after 15 minutes of inactivity (free tier limitation)

**Deployment Steps:**

1. **Sign up at [render.com](https://render.com)**
   - Use GitHub account for easy deployment

2. **Prepare Backend for Deployment:**

   ```bash
   cd FactoBackendServices
   ```

   Create a new file `.env.prod` with production variables:
   
   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://facto-admin:YOUR_PASSWORD@facto-cluster.xxxxx.mongodb.net/facto_app?retryWrites=true&w=majority
   
   # Server
   PORT=3000
   NODE_ENV=prod
   
   # JWT
   JWT_SECRET=your_very_strong_random_secret_here
   JWT_EXPIRES_IN=7d
   
   # Razorpay (Get from Razorpay Dashboard)
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   
   # Cloudinary (Get from Cloudinary Dashboard)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # File Upload
   MAX_FILE_SIZE_MB=10
   
   # Twilio (Optional)
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

3. **Deploy to Render:**

   - Go to [render.com/dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository
   - Configure:
     - **Name**: `facto-backend-api`
     - **Branch**: `master`
     - **Root Directory**: `FactoBackendServices`
     - **Runtime**: `Node`
     - **Build Command**: `npm install && npm run build-ts:prod`
     - **Start Command**: `npm run start:prod`
   
   - **Add Environment Variables:**
     Click "Add Environment Variable" and add all variables from `.env.prod`
   
   - **Settings:**
     - Instance Type: Free
     - Plan: Free
   
   - Click "Create Web Service"

4. **Get Your Backend URL:**
   - After deployment, you'll get a URL like: `https://facto-backend-api.onrender.com`
   - Use this for your API: `https://facto-backend-api.onrender.com/api/v1`

**Important Notes:**
- Service might sleep after 15 minutes of inactivity
- First request after sleep can take ~50 seconds (cold start)
- Consider upgrading to $7/month for 0 sleep time

---

### Phase 3: Frontend Deployment (FREE)

#### Option 1: Vercel (Recommended - Instant Deploy)

**Advantages:**
- ⚡ Instant deployments
- 🚀 Global CDN
- 🔄 Automatic preview for PRs
- 💨 Zero config

**Steps:**

1. **Deploy User Web App:**
   ```bash
   cd FactoUserWebApp
   ```

2. **Update API Configuration:**
   
   Edit `src/api/services.ts`, `src/api/blogs.ts`, `src/api/courses.ts`:
   
   ```typescript
   const API_BASE_URL = 'https://facto-backend-api.onrender.com/api/v1';
   ```

3. **Login to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub

4. **Deploy:**
   - Click "Add New Project"
   - Import your repository
   - Set **Root Directory** to `FactoUserWebApp`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click "Deploy"

5. **Deploy Admin App:**
   - Repeat steps
   - **Root Directory**: `FactoAdminApp`
   - Update API URL in `src/utils/apiConstants.ts`:
     ```typescript
     export const BASE_URL = "https://facto-backend-api.onrender.com/api/v1";
     ```

#### Option 2: Netlify (Alternative)

**Steps:**

1. **Deploy User Web App:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Sites" → "Add New Site" → "Import an existing project"
   - Connect GitHub repository
   - Configure build settings:
     - Base directory: `FactoUserWebApp`
     - Build command: `npm run build`
     - Publish directory: `FactoUserWebApp/dist`

2. **Repeat for Admin App**

---

## 💰 Cost Breakdown (Monthly)

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| MongoDB Atlas | M0 Free | **$0** | 512MB storage |
| Render Backend | Free | **$0** | Sleeps after inactivity |
| Vercel/Netlify | Free | **$0** | 100GB bandwidth |
| **TOTAL** | | **$0/month** | ✅ |

**Free Tier Limits:**
- Render: 750 hours compute (enough for 1 service 24/7)
- Sleep on inactivity (first request ~50s load)
- 100GB bandwidth/month on Vercel/Netlify

---

## 🚀 Production Upgrade Options (When You Need More)

### Option A: Upgrade Backend Only ($7/month)
- Render.com: $7/month → No sleep, better performance
- Keep everything else free
- **Total: $7/month**

### Option B: Full Production ($25-50/month)
- **Backend**: Render.com ($7) or Railway.app ($5)
- **Database**: MongoDB Atlas M2 ($7/month)
- **Frontend**: Keep on free tier or upgrade for custom domain
- **Total: $14-25/month**

---

## 📋 Deployment Checklist

### Before Deployment
- [ ] MongoDB Atlas account created
- [ ] Database connection string saved
- [ ] Razorpay account setup (test/live keys)
- [ ] Cloudinary account setup
- [ ] Environment variables documented
- [ ] All services tested locally

### Backend Deployment
- [ ] Render.com account created
- [ ] Backend deployed to Render
- [ ] Environment variables added
- [ ] Backend URL tested (check if API responds)
- [ ] CORS configured for frontend URLs

### Frontend Deployment
- [ ] API URLs updated to production backend
- [ ] User app deployed
- [ ] Admin app deployed
- [ ] All pages load correctly
- [ ] Authentication working
- [ ] Payment integration tested (test mode)

### After Deployment
- [ ] Test all major features
- [ ] Set up custom domains (optional)
- [ ] Configure email notifications (optional)
- [ ] Set up monitoring (optional)
- [ ] Document production credentials securely

---

## 🔧 Production Environment Variables

### Backend (.env on Render.com)
```env
# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://facto-admin:PASSWORD@facto-cluster.xxxxx.mongodb.net/facto_app?retryWrites=true&w=majority

# Server
PORT=3000
NODE_ENV=prod

# JWT - Generate a strong random string
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRES_IN=7d

# Razorpay - Get from dashboard.razorpay.com
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=webhook_secret_here

# Cloudinary - Get from cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Upload
MAX_FILE_SIZE_MB=10

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Frontend - Update These Files:

**User Web App:** `src/api/services.ts`, `blogs.ts`, `courses.ts`
```typescript
const API_BASE_URL = 'https://facto-backend-api.onrender.com/api/v1';
```

**Admin App:** `src/utils/apiConstants.ts`
```typescript
export const BASE_URL = "https://facto-backend-api.onrender.com/api/v1";
```

---

## 🎯 Recommended Setup (My Recommendation)

For **cheapest reliable deployment**:

1. **MongoDB**: MongoDB Atlas M0 (FREE forever)
2. **Backend**: Render.com Free tier (consider upgrading to $7/month when you have traffic)
3. **Frontend**: Vercel (FREE, instant deploys)

**Why this combination:**
- ✅ $0/month to start
- ✅ Easy to upgrade when needed
- ✅ Production-ready
- ✅ Great performance
- ✅ Automatic SSL
- ✅ Built-in CI/CD

**When to upgrade:**
- Backend sleep time bothers you → Upgrade to $7/month
- Need more storage → Upgrade MongoDB to $7/month
- Getting real traffic → Consider $25/month full plan

---

## 🔒 Important Security Notes

1. **Never commit `.env` files** to Git
2. **Use strong JWT secrets** (minimum 32 characters, random)
3. **Keep MongoDB password secure**
4. **Use HTTPS** (automatically provided by cloud providers)
5. **Enable 2FA** on all accounts
6. **Rotate secrets** regularly
7. **Keep dependencies updated**

---

## 🆘 Troubleshooting

### Backend Not Starting
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check Render logs for errors
- Ensure PORT is set to 3000 or Render's assigned port

### Frontend Can't Connect to Backend
- Verify backend URL is correct
- Check CORS configuration in backend
- Verify backend is not sleeping
- Check browser console for errors

### Payment Not Working
- Verify Razorpay keys are correct
- Use test keys for testing
- Check payment logs in backend
- Verify webhook URLs

### Database Connection Issues
- Check MongoDB Atlas network access (0.0.0.0/0 allowed)
- Verify connection string has password replaced
- Check database user has proper permissions
- Verify firewall isn't blocking connection

---

## 📞 Support

If you encounter issues:
1. Check individual service logs (Render/Vercel dashboards)
2. Review this guide
3. Check project-specific READMEs
4. Contact cloud provider support

---

## ✨ Next Steps After Deployment

1. **Monitor** your applications (Render/Vercel dashboards)
2. **Set up** custom domains if needed
3. **Enable** email notifications
4. **Test** all features thoroughly
5. **Document** your production setup
6. **Backup** your database regularly

**Good luck with your deployment! 🚀**



