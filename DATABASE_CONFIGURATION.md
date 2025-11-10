# Database Configuration Guide

## Why Localhost Shows Different Data Than Production

The localhost backend and production backend (Render.com) connect to **different MongoDB databases** because they use different `MONGODB_URI` environment variables.

### Production Backend (Render.com)
- Uses environment variables set in Render.com dashboard
- Connects to: **Production MongoDB Atlas database** (has all 24 services)
- Connection string: Set in Render.com → Environment → `MONGODB_URI`

### Localhost Backend
- Uses `.env` file in `FactoBackendServices/` directory
- Connects to: **Whatever database is in your local `.env` file**
- This might be:
  - A different MongoDB Atlas database
  - A local MongoDB instance
  - A test/development database with incomplete data

## Solution: Use Same Database as Production

To make localhost backend show the same data as production, you need to use the **same MongoDB connection string**.

### Option 1: Use Production Database (Recommended for Testing)

1. **Get the production MongoDB URI from Render.com:**
   - Go to Render.com dashboard
   - Select your backend service (`facto-backend-api`)
   - Go to "Environment" tab
   - Copy the `MONGODB_URI` value

2. **Create/Update `.env` file in `FactoBackendServices/` directory:**
   ```env
   MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority
   PORT=8080
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
   # ... other required variables
   ```

3. **Restart your local backend:**
   ```bash
   cd FactoBackendServices
   npm start
   ```

4. **Verify connection:**
   ```bash
   npm run verify:db
   ```
   This will show you which database you're connected to and how many services/sub-services it has.

### Option 2: Sync Data to Local Database

If you want to use a separate local database but have the same data:

1. **Export data from production database:**
   ```bash
   # Use MongoDB Compass or mongodump
   mongodump --uri="<production_connection_string>" --db=facto_app --out=./backup
   ```

2. **Import to local database:**
   ```bash
   mongorestore --uri="<local_connection_string>" --db=facto_app ./backup/facto_app
   ```

### Option 3: Seed Services to Local Database

If your local database is empty or missing services:

1. **Run seed scripts:**
   ```bash
   cd FactoBackendServices
   
   # Seed main services
   npm run seed:services
   
   # Seed sub-services (use admin app scripts)
   cd ../FactoAdminApp
   node add-services-from-excel.js
   ```

## Verify Database Connection

Run the verification script to see which database you're connected to:

```bash
cd FactoBackendServices
npm run verify:db
```

This will show:
- Which database you're connected to
- How many services and sub-services exist
- Category breakdown

## Important Notes

⚠️ **Warning:** If you use the production database for local development:
- **Be careful with writes** - you'll be modifying production data
- Consider using a **read-only user** for local development
- Or use a **separate test database** with the same data

## Recommended Setup

For local development, use **Option 1** (same database) but:
1. Use a **read-only MongoDB user** for local development
2. Or create a **test database** that mirrors production
3. Only use production database for final testing before deployment

