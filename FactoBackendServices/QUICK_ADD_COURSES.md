# Quick Guide: Add 5 Courses to Production Database

## Current Status
Your `.env` file is currently pointing to: `mongodb://localhost:27017/facto_app` (local database)

## Steps to Add Courses to Production

### Step 1: Get Production MongoDB URI from Render.com

1. **Go to Render.com Dashboard**: https://dashboard.render.com
2. **Select your backend service**: `facto-backend-api` (or your backend service name)
3. **Click on "Environment" tab**
4. **Find `MONGODB_URI`** in the environment variables list
5. **Copy the entire connection string** (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/facto_app?...`)

### Step 2: Update .env File

1. **Open** `FactoBackendServices/.env` file
2. **Replace** the `MONGODB_URI` line with the production URI from Render.com:

```env
MONGODB_URI=mongodb+srv://...your-production-connection-string-from-render.../facto_app?retryWrites=true&w=majority
```

⚠️ **Important**: 
- Make sure the connection string includes `/facto_app` as the database name
- Keep the `?retryWrites=true&w=majority` parameters

### Step 3: Verify Connection to Production Database

Run this command to verify you're connected to the production database:

```bash
cd FactoBackendServices
npm run verify:db
```

You should see:
- ✅ Connected to MongoDB
- 🗄️ Database: facto_app
- 📊 Database Statistics showing production data (should have many services/sub-services)

### Step 4: Add Courses to Production

Once verified, run:

```bash
npm run add:manual-courses
```

This will add the 5 courses:
1. Complete ITR Filing Guide 2024
2. GST Return Filing - GSTR-1, GSTR-3B Complete Guide
3. Tax Planning & Savings Strategies for FY 2024-25
4. Company Registration & Compliance Essentials
5. Bookkeeping & Accounting for Small Businesses

### Step 5: Verify Courses Were Added

```bash
npm run verify:courses
```

This will show all published courses in the database.

## After Adding Courses

The courses will automatically appear in:
- ✅ **Admin App** (Vercel) - Courses section
- ✅ **User Web App** (Vercel) - Learning section

No redeployment needed - the apps fetch data from the database in real-time!

## Need Help?

If you can't find the MongoDB URI in Render.com:
1. Check the "Environment" tab in your Render.com service
2. Look for variables starting with `MONGODB` or `MONGO`
3. The URI should be a long string starting with `mongodb+srv://`

