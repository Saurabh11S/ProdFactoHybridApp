# 🚀 Quick Deployment Guide - 5 Minutes Setup

## Option 1: Cheapest (FREE) - Start Here ✅

### Step 1: MongoDB (2 minutes)
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up → Create M0 Free cluster
3. Create user, set network access (0.0.0.0/0)
4. Copy connection string
5. **Cost: $0/month**

### Step 2: Backend (3 minutes)
1. Go to: https://render.com
2. Connect GitHub repo
3. New Web Service → Select repo
4. Configure:
   - Root: `FactoBackendServices`
   - Build: `npm install && npm run build-ts:prod`
   - Start: `npm run start:prod`
5. Add all env variables from `.env.prod`
6. **Cost: $0/month** (sleeps after 15min)

### Step 3: Frontend (2 minutes)
1. Go to: https://vercel.com
2. Import project from GitHub
3. Deploy User App:
   - Set root to: `FactoUserWebApp`
   - Build command: `npm run build`
4. Update API URLs to your Render backend URL
5. Repeat for Admin App
6. **Cost: $0/month**

**Total Monthly Cost: $0** 💰

---

## Option 2: Better Performance ($7/month)

Same as above BUT:
- Upgrade Render backend to $7/month → No sleep, faster
- Keep MongoDB free
- Keep frontend free

**Total Monthly Cost: $7** 💰

---

## Option 3: Production Ready ($25/month)

- MongoDB Atlas M2: $7/month
- Render backend $7: $7/month  
- Custom domains: ~$15/year
- CDN: Free

**Total: ~$25/month** 💰

---

## My Recommendation ⭐

**Start with Option 1 (FREE)**
- Test everything works
- Get users
- When sleep time bothers you → Upgrade backend to $7/month

**This keeps you at $0-$7/month** and scales when needed!

---

## Quick Reference

### MongoDB Atlas
- URL: https://www.mongodb.com/cloud/atlas
- Free tier: M0 (512MB, forever free)
- Connection: `mongodb+srv://user:pass@cluster.xxx.mongodb.net/facto_app`

### Render.com
- URL: https://render.com
- Free tier: 750 hours/month
- Backend URL: `https://your-app.onrender.com`
- Note: Sleeps after 15min inactivity

### Vercel
- URL: https://vercel.com
- Free tier: Unlimited projects
- Frontend URLs: `https://your-app.vercel.app`
- Note: Automatic HTTPS, global CDN

---

## Environment Variables to Set

### Backend (Render.com)
```env
MONGODB_URI=your_mongodb_atlas_uri
PORT=3000
NODE_ENV=prod
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend
Update API URLs in code to point to your Render backend URL.

---

## Deployment URLs Structure

```
User App:     https://facto-app.vercel.app
Admin App:    https://facto-admin.vercel.app
Backend API:  https://facto-backend.onrender.com/api/v1
```

---

## Tips for Cheap Deployment ✅

1. **Use free tier first** - test everything
2. **Monitor usage** - upgrade only when needed
3. **Use MongoDB Atlas M0** - free forever
4. **Accept 15min sleep** - upgrade if needed ($7/month)
5. **Use Vercel for frontend** - best free tier
6. **Don't over-provision** - scale as needed

---

## When to Upgrade? 

Upgrade if:
- ⏰ Sleep time affects user experience
- 📈 You have >1000 daily active users  
- 💾 You need >512MB database
- 🚀 You need custom domains

**Remember: Start free, upgrade when needed!**

---

## One-Command Deploy (Coming Soon)

We'll add GitHub Actions to auto-deploy on push to master.

For now, manual deploy works perfectly! 🎯













