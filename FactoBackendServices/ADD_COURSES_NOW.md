# ⚡ QUICK FIX: Add Courses to Production Database

## Current Situation
✅ API connection working  
✅ Authentication working  
❌ Production database has **0 courses**

## Solution: Add 5 Courses to Production

### Step 1: Get Production MongoDB URI

1. **Go to Render.com**: https://dashboard.render.com
2. **Select your backend service** (usually named `facto-backend-api`)
3. **Click "Environment" tab**
4. **Find `MONGODB_URI`** in the environment variables
5. **Copy the entire connection string**

   It should look like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/facto_app?retryWrites=true&w=majority
   ```

### Step 2: Update .env File

1. **Open** `FactoBackendServices/.env` file
2. **Find the line** starting with `MONGODB_URI=`
3. **Replace it** with the production URI from Render.com:

   ```env
   MONGODB_URI=mongodb+srv://...your-production-uri-from-render.../facto_app?retryWrites=true&w=majority
   ```

   ⚠️ **IMPORTANT**: Make sure the connection string includes `/facto_app` as the database name!

### Step 3: Verify Connection to Production

Run this command to verify you're connected to production:

```bash
cd FactoBackendServices
npm run verify:db
```

**Expected Output:**
- ✅ Connected to MongoDB
- 🗄️ Database: facto_app
- 📊 Should show production data (many services/sub-services)

If it shows only 4-5 services, you're still connected to local database!

### Step 4: Add Courses to Production

Once verified, run:

```bash
npm run add:manual-courses
```

**Expected Output:**
```
✅ Created course: Complete ITR Filing Guide 2024
✅ Created course: GST Return Filing - GSTR-1, GSTR-3B Complete Guide
✅ Created course: Tax Planning & Savings Strategies for FY 2024-25
✅ Created course: Company Registration & Compliance Essentials
✅ Created course: Bookkeeping & Accounting for Small Businesses

📊 Summary:
   ✅ Courses created: 5
   ⏭️  Courses skipped (already exist): 0
```

### Step 5: Verify Courses Were Added

```bash
npm run verify:courses
```

**Expected Output:**
```
📊 Total courses in database: 5
✅ Published courses: 5
```

### Step 6: Check Vercel Admin App

1. **Refresh** the Admin App on Vercel
2. **Go to Courses page**
3. **You should now see 5 courses!**

## Courses That Will Be Added

1. **Complete ITR Filing Guide 2024** (ITR) - ₹2,499
2. **GST Return Filing - GSTR-1, GSTR-3B Complete Guide** (GST) - ₹3,499
3. **Tax Planning & Savings Strategies for FY 2024-25** (Tax Planning) - ₹2,999
4. **Company Registration & Compliance Essentials** (Registration) - ₹1,999
5. **Bookkeeping & Accounting for Small Businesses** (Outsourcing) - ₹2,799

All courses will be:
- ✅ Status: `published` (visible immediately)
- ✅ Ready to configure lectures from Admin App
- ✅ Visible in both Admin App and User Web App

## Troubleshooting

### "MONGODB_URI environment variable is not set"
- Make sure `.env` file exists in `FactoBackendServices/` directory
- Check that `MONGODB_URI=` line is present

### "Connection failed"
- Verify the MongoDB URI is correct
- Check if connection string includes `/facto_app` database name
- Ensure your IP is whitelisted in MongoDB Atlas (if required)

### "Courses still not showing on Vercel"
- Wait 10-15 seconds after adding courses
- Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for any new errors
- Verify courses were actually created: `npm run verify:courses`

## Need Help?

If you can't find the MongoDB URI in Render.com:
1. Go to your backend service in Render.com
2. Click "Environment" tab
3. Look for variables starting with `MONGODB` or `MONGO`
4. The URI should be a long string starting with `mongodb+srv://`

