# Add 5 Courses to Production Database

## Prerequisites

Before running the script, ensure you have the **production MongoDB URI** configured in your `.env` file.

## Step 1: Get Production MongoDB URI

1. Go to **Render.com** dashboard
2. Select your backend service (`facto-backend-api`)
3. Go to **Environment** tab
4. Copy the `MONGODB_URI` value

## Step 2: Configure Local Environment

1. **Create/Update `.env` file** in `FactoBackendServices/` directory:
   ```env
   MONGODB_URI=mongodb+srv://...your-production-connection-string.../facto_app?retryWrites=true&w=majority
   PORT=8080
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
   ```

   ⚠️ **Important**: Make sure the connection string includes `/facto_app` as the database name.

## Step 3: Verify Database Connection

Run the verification script to confirm you're connected to the production database:

```bash
cd FactoBackendServices
npm run verify:db
```

This will show:
- Which database you're connected to
- Current number of courses
- Database host (should show MongoDB Atlas if production)

## Step 4: Add Courses to Production

Run the script to add the 5 manual courses:

```bash
cd FactoBackendServices
npm run add:manual-courses
```

The script will:
- ✅ Connect to the production database
- ✅ Check if each course already exists (by title)
- ✅ Create only new courses (skip existing ones)
- ✅ Show a summary of created/skipped courses

## Courses That Will Be Added

1. **Complete ITR Filing Guide 2024** (ITR) - ₹2,499
2. **GST Return Filing - GSTR-1, GSTR-3B Complete Guide** (GST) - ₹3,499
3. **Tax Planning & Savings Strategies for FY 2024-25** (Tax Planning) - ₹2,999
4. **Company Registration & Compliance Essentials** (Registration) - ₹1,999
5. **Bookkeeping & Accounting for Small Businesses** (Outsourcing) - ₹2,799

All courses will be created with:
- Status: `published` (visible in both Admin and User apps)
- Total Lectures: 1 (minimum, can be updated from Admin App)
- Empty lectures array (to be configured from Admin App)

## Step 5: Verify Courses Were Added

After running the script, verify the courses:

```bash
npm run verify:courses
```

This will show:
- Total courses in database
- Published courses count
- List of all published courses

## Step 6: Check in Vercel Apps

After adding courses to production database:

1. **Admin App** (Vercel):
   - Go to Courses section
   - You should see the 5 new courses
   - You can configure lectures, update details, etc.

2. **User Web App** (Vercel):
   - Go to Learning section
   - You should see the 5 new courses available for enrollment

## Troubleshooting

### Error: "MONGODB_URI environment variable is not set"
- Make sure `.env` file exists in `FactoBackendServices/` directory
- Check that `MONGODB_URI` is set in the file

### Error: "Connection failed"
- Verify the MongoDB URI is correct
- Check if the connection string includes the database name (`/facto_app`)
- Ensure your IP is whitelisted in MongoDB Atlas (if required)

### Courses not appearing in Vercel
- Wait a few seconds for the backend to refresh
- Check browser console for API errors
- Verify backend is running and accessible
- Check that courses have `status: 'published'`

## Important Notes

⚠️ **Warning**: This script modifies the **production database**. Make sure:
- You have the correct MongoDB URI
- You're connected to the production database (not a test database)
- You've verified the connection before running the script

✅ **Safe**: The script checks for existing courses and won't create duplicates.

