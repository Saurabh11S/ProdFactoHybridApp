# MongoDB Connection String Update Guide

## Updated Connection String

The MongoDB connection string has been updated to include the `facto_app` database name.

### Connection String Format

**Before:**
```
mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/?appName=facto-cluster
```

**After (with database name):**
```
mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?appName=facto-cluster
```

### Key Changes

1. **Added database name**: `/facto_app` is now included in the connection string
2. **Database location**: The database name goes **before** the query parameters (`?`)

### Connection String Structure

```
mongodb+srv://[username]:[password]@[cluster]/[database_name]?[query_params]
                              ↓
                         facto_app
```

## Where to Set the Connection String

### 1. Environment Variable (Recommended)

Set the `MONGODB_URI` environment variable in your backend service:

**For Local Development:**
Create a `.env` file in `FactoBackendServices/` directory:

```env
MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?appName=facto-cluster
```

**For Production (Render.com):**
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add/Update `MONGODB_URI` with the new connection string:
   ```
   mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?appName=facto-cluster
   ```

### 2. Verify Connection

After updating the connection string, restart your backend service. You should see in the logs:

```
✅ MongoDB connected successfully!
🗄️ Database: facto_app
```

## Collections in `facto_app` Database

The following collections will be used:

1. **`service`** - Main service categories
2. **`subService`** - Sub-services (what users see on Services page)
3. **`user`** - User accounts
4. **`userPurchase`** - User service purchases
5. **`paymentOrder`** - Payment orders
6. **`quotation`** - Service quotations
7. **`blog`** - Blog posts
8. **`course`** - Courses
9. And other collections as needed

## Testing the Connection

### Method 1: Check Backend Logs

When the backend starts, you should see:
```
🔌 === DATABASE CONNECTION START ===
🔗 MongoDB URI: mongodb+srv://factoDB:****@facto-cluster.2yoapwv.mongodb.net/facto_app?appName=facto-cluster
✅ MongoDB connected successfully!
🗄️ Database: facto_app
```

### Method 2: Test API Endpoints

After updating the connection string and restarting the backend:

1. **Test Services Endpoint:**
   ```
   GET https://facto-backend-api.onrender.com/api/v1/services
   ```

2. **Test Sub-Services Endpoint:**
   ```
   GET https://facto-backend-api.onrender.com/api/v1/sub-services/all
   ```

3. **Check if data appears in:**
   - FactoUserWebApp Services page
   - FactoAdminApp Services management

## Important Notes

1. **URL Encoding**: The password contains `@` which is encoded as `%40` in the connection string
2. **Database Name**: The database name `facto_app` is case-sensitive
3. **Restart Required**: After updating the connection string, you must restart the backend service
4. **No Frontend Changes**: Only the backend connection string needs to be updated. The frontend apps (UserWebApp and AdminApp) will automatically use the correct data once the backend is connected.

## Troubleshooting

### Issue: "Database not found"
- **Solution**: Make sure the database name `facto_app` is spelled correctly in the connection string

### Issue: "Authentication failed"
- **Solution**: Verify the username and password are correct. The `@` in password should be encoded as `%40`

### Issue: "Connection timeout"
- **Solution**: 
  1. Check your IP is whitelisted in MongoDB Atlas
  2. Verify network connectivity
  3. Check if MongoDB Atlas cluster is running

### Issue: "Services not showing"
- **Solution**:
  1. Verify backend is connected to `facto_app` database
  2. Check if services exist in `service` and `subService` collections
  3. Verify services have `isActive: true`
  4. Check backend API logs for errors

## Next Steps

1. ✅ Update connection string in `.env` file (for local) or Render environment variables (for production)
2. ✅ Restart backend service
3. ✅ Verify connection in backend logs
4. ✅ Test API endpoints
5. ✅ Verify services appear in UserWebApp and AdminApp

