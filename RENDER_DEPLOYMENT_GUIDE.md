# 🚀 Render.com Backend Deployment Guide

Complete step-by-step guide to deploy `FactoBackendServices` to Render.com.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Render.com account (sign up at https://render.com)
- ✅ GitHub account with your repository
- ✅ All production credentials ready:
  - MongoDB Atlas connection string
  - Razorpay production keys
  - Cloudinary production credentials
  - JWT secret (generate a strong one)
  - Twilio credentials (if using SMS)

---

## 🔧 Step 1: Create Render Account & Connect GitHub

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Sign up or log in
3. Click **"New +"** button (top right)
4. Select **"Web Service"**
5. If prompted, connect your GitHub account
   - Authorize Render to access your repositories
   - Select the repositories you want to deploy

---

## 🎯 Step 2: Create New Web Service

1. After connecting GitHub, you'll see a list of repositories
2. Find and select: **`HybridFactoConsultancyApp`**
3. Click **"Connect"**

---

## ⚙️ Step 3: Configure Service Settings

Fill in the following configuration:

### Basic Settings

- **Name:** `facto-backend-api` (or your preferred name)
- **Region:** Choose closest to your users
  - Recommended: `Singapore` (for India) or `Oregon` (US)
- **Branch:** `main` (or your production branch)
- **Root Directory:** `FactoBackendServices` ⚠️ **IMPORTANT**
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build-ts:prod`
- **Start Command:** `npm run start:prod`
- **Auto-Deploy:** `Yes` (deploys automatically on git push)

### Advanced Settings (Optional)

- **Health Check Path:** Leave empty (or set to `/health` if you have one)
- **Dockerfile Path:** Leave empty (we're using npm commands)

### Click **"Create Web Service"**

---

## 🔐 Step 4: Set Environment Variables

**⚠️ CRITICAL:** Set these BEFORE the first deployment completes.

1. In your Render service dashboard, click on **"Environment"** tab
2. You'll see an empty list or some default variables
3. Click **"Add Environment Variable"** for each variable below

### Required Environment Variables

Add these one by one:

#### 1. MongoDB Connection
```
Key: MONGODB_URI
Value: mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
```

#### 2. Server Configuration
```
Key: PORT
Value: 8080
```

```
Key: NODE_ENV
Value: production
```

#### 3. JWT Configuration

**Generate a strong JWT secret first:**
- Option 1: Use online generator: https://randomkeygen.com/
- Option 2: Use command: `openssl rand -base64 32`
- Option 3: Use Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

Then set:
```
Key: JWT_SECRET
Value: [Your generated 32+ character random string]
```

```
Key: JWT_EXPIRES_IN
Value: 7d
```

#### 4. Razorpay Production Keys

Get these from: https://dashboard.razorpay.com/app/keys

```
Key: RAZORPAY_KEY_ID
Value: rzp_live_xxxxxxxxxxxxx
```

```
Key: RAZORPAY_KEY_SECRET
Value: [Your production Razorpay secret key]
```

```
Key: RAZORPAY_WEBHOOK_SECRET
Value: [Your production webhook secret]
```

#### 5. Cloudinary Configuration

Get these from: https://console.cloudinary.com/settings/api-keys

```
Key: CLOUDINARY_CLOUD_NAME
Value: [Your Cloudinary cloud name]
```

```
Key: CLOUDINARY_API_KEY
Value: [Your Cloudinary API key]
```

```
Key: CLOUDINARY_API_SECRET
Value: [Your Cloudinary API secret]
```

#### 6. File Upload Settings
```
Key: MAX_FILE_SIZE_MB
Value: 10
```

#### 7. Twilio SMS (Optional - if using SMS)

Get these from: https://console.twilio.com/

```
Key: TWILIO_ACCOUNT_SID
Value: [Your Twilio Account SID]
```

```
Key: TWILIO_AUTH_TOKEN
Value: [Your Twilio Auth Token]
```

```
Key: TWILIO_PHONE_NUMBER
Value: [Your Twilio phone number]
```

#### 8. CORS Configuration

**⚠️ IMPORTANT:** Update this AFTER deploying your frontend apps to Vercel.

For now, set a placeholder:
```
Key: CORS_ORIGIN
Value: https://your-user-app.vercel.app,https://your-admin-app.vercel.app
```

**After deploying frontend apps, come back and update with actual URLs.**

---

## 🚀 Step 5: Start Deployment

1. After setting all environment variables, click **"Save Changes"**
2. Render will automatically start building your service
3. You'll see the deployment progress in the **"Logs"** tab

### What Happens During Deployment:

1. **Install Dependencies:** `npm install`
2. **Build TypeScript:** `npm run build-ts:prod`
3. **Start Server:** `npm run start:prod`
4. **Health Check:** Render checks if service is running

**Expected Time:** 3-5 minutes for first deployment

---

## ✅ Step 6: Verify Deployment

### Check Deployment Status

1. Go to **"Logs"** tab
2. Look for:
   - ✅ "Build successful"
   - ✅ "Server started on port 8080"
   - ✅ "Database connected successfully"
   - ❌ No error messages

### Test Your Backend

1. Note your service URL (shown at top of dashboard):
   - Format: `https://facto-backend-api.onrender.com`
   - Or custom domain if configured

2. Test endpoints:
   - Health check (if available): `https://your-backend-url.onrender.com/health`
   - API base: `https://your-backend-url.onrender.com/api/v1`

3. Check logs for any errors

---

## 🔍 Step 7: Monitor & Troubleshoot

### View Logs

1. Click **"Logs"** tab in Render dashboard
2. Real-time logs show:
   - Server requests
   - Errors
   - Database connections
   - API calls

### Common Issues & Solutions

#### Issue 1: Build Fails

**Symptoms:** Red deployment status, build errors in logs

**Solutions:**
- Check build command is correct: `npm install && npm run build-ts:prod`
- Verify `Root Directory` is set to `FactoBackendServices`
- Check package.json has all required scripts
- Review build logs for specific errors

#### Issue 2: Service Crashes on Start

**Symptoms:** Service starts then immediately stops

**Solutions:**
- Check start command: `npm run start:prod`
- Verify all environment variables are set
- Check logs for specific error messages
- Ensure `NODE_ENV=production` is set

#### Issue 3: Database Connection Fails

**Symptoms:** Database connection errors in logs

**Solutions:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access allows all IPs (0.0.0.0/0)
- Verify database credentials are correct
- Ensure database name is included in connection string: `/facto_app`

#### Issue 4: Port Issues

**Symptoms:** Service can't bind to port

**Solutions:**
- Render automatically assigns port, but check `PORT` env var
- Ensure start command doesn't hardcode port
- Render uses `process.env.PORT` automatically

#### Issue 5: Environment Variables Not Working

**Symptoms:** Service can't find env vars

**Solutions:**
- Verify variables are set in **"Environment"** tab
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables
- No `.env` file needed - Render uses dashboard variables

---

## 🔄 Step 8: Update CORS After Frontend Deployment

**After deploying your frontend apps to Vercel:**

1. Note your Vercel app URLs:
   - User App: `https://your-user-app.vercel.app`
   - Admin App: `https://your-admin-app.vercel.app`

2. Go back to Render dashboard → Your service → **"Environment"** tab

3. Find `CORS_ORIGIN` variable

4. Update value with actual URLs:
   ```
   https://your-user-app.vercel.app,https://your-admin-app.vercel.app
   ```

5. Click **"Save Changes"**

6. Render will automatically redeploy with new CORS settings

---

## 📊 Step 9: Configure Auto-Deploy (Optional)

Auto-deploy is enabled by default, but verify:

1. Go to **"Settings"** tab
2. Under **"Auto-Deploy"**:
   - ✅ Should be enabled
   - Branch: `main` (or your production branch)
3. This means every `git push` to main branch triggers automatic deployment

---

## 🔒 Step 10: Security Checklist

Before going live, verify:

- [ ] `JWT_SECRET` is strong (32+ characters, random)
- [ ] Using Razorpay **production** keys (not test keys)
- [ ] Using Cloudinary **production** credentials
- [ ] MongoDB connection string is secure
- [ ] `NODE_ENV=production` is set
- [ ] CORS only allows your Vercel domains
- [ ] No sensitive data in code (all in environment variables)
- [ ] `.env` files are in `.gitignore` (not committed)

---

## 📝 Step 11: Custom Domain (Optional)

If you want a custom domain:

1. Go to **"Settings"** tab
2. Scroll to **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain: `api.yourdomain.com`
5. Follow DNS configuration instructions
6. Render will provide SSL certificate automatically

---

## 🔄 Manual Deployment

If auto-deploy is disabled or you want to deploy manually:

1. Go to **"Manual Deploy"** tab
2. Select branch: `main`
3. Click **"Deploy latest commit"**
4. Monitor deployment in **"Logs"** tab

---

## 📈 Monitoring & Scaling

### View Metrics

1. Go to **"Metrics"** tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Scaling (Paid Plans)

For free tier:
- Service sleeps after 15 minutes of inactivity
- Wakes up on first request (may take 30-60 seconds)

For paid plans:
- Service stays awake 24/7
- Can scale horizontally
- Better performance

---

## 🆘 Getting Help

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Support: support@render.com

### Check Logs
- Always check **"Logs"** tab first
- Look for error messages
- Check deployment logs vs runtime logs

---

## ✅ Deployment Checklist

Before considering deployment complete:

- [ ] Service is created and configured
- [ ] All environment variables are set
- [ ] Build command: `npm install && npm run build-ts:prod`
- [ ] Start command: `npm run start:prod`
- [ ] Root directory: `FactoBackendServices`
- [ ] Deployment successful (green status)
- [ ] Backend URL is accessible
- [ ] Database connection works
- [ ] Logs show no errors
- [ ] CORS updated with frontend URLs (after frontend deployment)

---

## 🎯 Quick Reference

### Service URL Format
```
https://[service-name].onrender.com
```

### API Base URL
```
https://[service-name].onrender.com/api/v1
```

### Important Tabs in Render Dashboard
- **Logs:** View deployment and runtime logs
- **Environment:** Set environment variables
- **Settings:** Configure service settings
- **Metrics:** View performance metrics
- **Events:** View deployment history

---

## 🚀 Next Steps

After backend is deployed:

1. ✅ Note your backend URL
2. ✅ Deploy frontend apps to Vercel (see Vercel deployment guide)
3. ✅ Update `CORS_ORIGIN` in Render with Vercel URLs
4. ✅ Test full application flow
5. ✅ Monitor logs for any issues

---

**Status:** Ready for Render Deployment
**Last Updated:** [Current Date]

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Node.js on Render:** https://render.com/docs/node

---

**🎉 Congratulations!** Your backend is now deployed to Render.com!

