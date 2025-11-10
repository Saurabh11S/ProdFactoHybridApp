# 🔄 Sync Configuration: Localhost, Vercel, and Render

## 🎯 Goal
Ensure all environments (localhost, Vercel, Render) use the **same production database** and **same backend API**.

## 📋 Current Issues

1. **Connection String Missing Database Name**
   - Current: `mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/?appName=facto-cluster`
   - **Missing**: `/facto_app` database name
   - **Fixed**: Code automatically adds it, but should be explicit

2. **Localhost vs Production Mismatch**
   - Localhost Admin App shows courses (local database)
   - Vercel Admin App shows blank (production database - no courses)
   - **Solution**: Use same production database everywhere

## ✅ Step-by-Step Sync Process

### Step 1: Fix MongoDB Connection String

**Your connection string:**
```
mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/?appName=facto-cluster
```

**Should be (with database name):**
```
mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
```

#### Update in Render.com:
1. Go to **Render.com** → Your backend service → **Environment** tab
2. Find `MONGODB_URI`
3. **Update it to include `/facto_app`**:
   ```
   mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
   ```
4. **Save** and **Redeploy** the backend service

#### Update Local .env File:
1. Open `FactoBackendServices/.env`
2. **Replace** `MONGODB_URI` with the same connection string:
   ```env
   MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
   ```

### Step 2: Verify Database Connection

Run this to verify you're connected to production:

```bash
cd FactoBackendServices
npm run verify:db
```

**Expected Output:**
- ✅ Connected to MongoDB
- 🗄️ Database: facto_app
- 🏠 Host: facto-cluster.2yoapwv.mongodb.net (MongoDB Atlas)
- 🌐 Database Type: Production (MongoDB Atlas)
- 📊 Should show many services/sub-services (production data)

### Step 3: Add Courses to Production Database

```bash
cd FactoBackendServices
npm run add:manual-courses
```

This adds 5 courses to the **production database** that will be visible in:
- ✅ Localhost Admin App (if using production DB)
- ✅ Vercel Admin App
- ✅ Vercel User Web App

### Step 4: Verify Courses

```bash
npm run check:admin-courses
```

This will show:
- Which database you're connected to
- All courses in the database
- JSON serialization test

### Step 5: Configure Frontend Apps

#### Admin App (Vercel):
- ✅ Already configured to auto-detect Vercel and use production backend
- ✅ Uses: `https://facto-backend-api.onrender.com/api/v1`

#### User Web App (Vercel):
- ✅ Already configured to auto-detect Vercel and use production backend
- ✅ Uses: `https://facto-backend-api.onrender.com/api/v1`

#### Localhost (Both Apps):
- **Option A**: Use production backend (recommended for testing)
  - Set in root `.env`:
    ```env
    VITE_API_URL=https://facto-backend-api.onrender.com/api/v1
    ```
- **Option B**: Use local backend (requires local backend running)
  - Set in root `.env`:
    ```env
    VITE_API_URL=http://localhost:8080/api/v1
    ```
  - **Important**: Local backend must use same production database!

### Step 6: Backend Configuration

#### Render.com Backend:
- ✅ Already configured with production MongoDB URI
- ✅ Just needs database name added to connection string

#### Localhost Backend:
- Must use **same production MongoDB URI** as Render.com
- Update `FactoBackendServices/.env` with production connection string

## 📊 Configuration Summary

### Production Database (MongoDB Atlas)
```
mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
```

### Production Backend API
```
https://facto-backend-api.onrender.com/api/v1
```

### Environment Variables

#### Render.com Backend:
```env
MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
PORT=8080
NODE_ENV=production
JWT_SECRET=your_jwt_secret
```

#### Local Backend (.env in FactoBackendServices/):
```env
MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
PORT=8080
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

#### Vercel Admin App (Environment Variables):
```env
VITE_API_URL=https://facto-backend-api.onrender.com/api/v1
```

#### Vercel User Web App (Environment Variables):
```env
VITE_API_URL=https://facto-backend-api.onrender.com/api/v1
```

#### Root .env (for localhost frontend apps):
```env
VITE_API_URL=https://facto-backend-api.onrender.com/api/v1
```

## 🔍 Verification Checklist

After syncing, verify:

- [ ] Render.com backend uses connection string with `/facto_app`
- [ ] Local backend `.env` uses same production connection string
- [ ] `npm run verify:db` shows production database (MongoDB Atlas)
- [ ] `npm run check:admin-courses` shows courses in database
- [ ] Vercel Admin App shows courses
- [ ] Vercel User Web App shows courses
- [ ] Localhost Admin App shows same courses (if using production backend)
- [ ] All apps connect to same backend API

## 🚨 Important Notes

1. **Single Source of Truth**: Production MongoDB Atlas database is the single source of truth
2. **All environments should use production database** for consistency
3. **Connection string must include `/facto_app`** as database name
4. **Backend on Render.com must be redeployed** after updating MONGODB_URI
5. **Frontend apps auto-detect Vercel** and use production backend automatically

## 🐛 Troubleshooting

### Courses still not showing on Vercel:
1. Check Render.com backend logs for database connection
2. Verify courses exist: `npm run check:admin-courses`
3. Check browser console on Vercel for API errors
4. Verify backend is using correct database name

### Localhost shows different data:
1. Check `FactoBackendServices/.env` - must use production MongoDB URI
2. Run `npm run verify:db` to confirm database connection
3. Ensure local backend is running and connected to production DB

### API connection issues:
1. Verify `VITE_API_URL` in Vercel environment variables
2. Check backend CORS settings allow Vercel domains
3. Verify backend is running on Render.com

