# 🔧 Fix: Courses and Blogs Not Showing on Vercel

## 🎯 Issues Fixed

1. **Courses API Serialization**: Added `.lean()` to course controller to return plain JavaScript objects
2. **Blogs API Serialization**: Added `.lean()` to blog controller to return plain JavaScript objects
3. **Database Connection**: Updated seedBlogs script to use correct database connection string

## 📋 Changes Made

### 1. Course Controller (`FactoBackendServices/src/controllers/course.controller.ts`)
- Added `.lean()` to the course query to ensure proper JSON serialization
- This fixes the issue where courses were not showing on Vercel User Web App

### 2. Blog Controller (`FactoBackendServices/src/controllers/blog.controller.ts`)
- Added `.lean()` to `getBlogs` query
- Added `.lean()` to `getBlogById` query
- This fixes the issue where blogs were not visible on Updates Page

### 3. Seed Blogs Script (`FactoBackendServices/src/scripts/seedBlogs.ts`)
- Updated to use correct database connection string with `/facto_app` database name
- Added production database detection

## 🚀 Next Steps

### Step 1: Deploy Backend Changes to Render.com

The backend changes need to be deployed to Render.com:

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix courses and blogs API serialization - add .lean()"
   git push origin master
   ```

2. **Render.com will auto-deploy** (or manually trigger deployment)

3. **Wait for deployment to complete** (2-3 minutes)

### Step 2: Verify Courses in Production Database

Run this to check if courses exist in production:

```bash
cd FactoBackendServices
npm run check:admin-courses
```

If no courses found, add them:

```bash
npm run add:manual-courses
```

### Step 3: Verify Blogs in Production Database

Run this to check if blogs exist in production:

```bash
cd FactoBackendServices
npm run seed:blogs
```

This will add sample blogs if they don't exist.

### Step 4: Test on Vercel

After backend deployment:

1. **Courses should appear** in Learning Section on Vercel User Web App
2. **Blogs should appear** on Updates Page on Vercel User Web App

## 🔍 Verification

### Check Courses API:
```bash
curl https://facto-backend-api.onrender.com/api/v1/course
```

Should return:
```json
{
  "success": true,
  "data": {
    "courses": [...]
  }
}
```

### Check Blogs API:
```bash
curl https://facto-backend-api.onrender.com/api/v1/blogs?page=1&limit=10
```

Should return:
```json
{
  "success": true,
  "data": {
    "blogs": [...],
    "pagination": {...}
  }
}
```

## ⚠️ Important Notes

1. **Backend must be redeployed** for changes to take effect
2. **Courses and blogs must exist** in production database
3. **Connection string must include `/facto_app`** database name
4. **Frontend apps auto-detect Vercel** and use production backend

## 🐛 Troubleshooting

### Courses still not showing:
1. Check backend logs on Render.com for errors
2. Verify courses exist: `npm run check:admin-courses`
3. Check browser console on Vercel for API errors
4. Verify API response structure matches frontend expectations

### Blogs still not showing:
1. Check backend logs on Render.com for errors
2. Verify blogs exist in database
3. Run `npm run seed:blogs` to add sample blogs
4. Check browser console on Vercel for API errors

