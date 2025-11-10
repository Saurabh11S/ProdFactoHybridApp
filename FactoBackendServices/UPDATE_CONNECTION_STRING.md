# 🔧 Update MongoDB Connection String

## Your Current Connection String

```
mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/?appName=facto-cluster
```

## ❌ Problem
- Missing database name `/facto_app`
- Missing connection options

## ✅ Corrected Connection String

```
mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
```

## 📝 Where to Update

### 1. Render.com Backend

1. Go to **Render.com Dashboard**: https://dashboard.render.com
2. Select your backend service (`facto-backend-api`)
3. Click **"Environment"** tab
4. Find `MONGODB_URI` variable
5. **Update** to:
   ```
   mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
   ```
6. Click **"Save Changes"**
7. **Redeploy** the service (or it will auto-redeploy)

### 2. Local Backend (.env file)

1. Open `FactoBackendServices/.env`
2. **Update** `MONGODB_URI` to:
   ```env
   MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster
   ```
3. Save the file

### 3. Verify Connection

After updating, verify:

```bash
cd FactoBackendServices
npm run verify:db
```

**Expected Output:**
```
✅ Connected to MongoDB
🗄️  Database: facto_app
🏠 Host: facto-cluster.2yoapwv.mongodb.net
🌐 Database Type: Production (MongoDB Atlas)
```

## 🔍 What Changed

- **Added**: `/facto_app` - Database name
- **Added**: `retryWrites=true&w=majority` - Connection reliability options
- **Kept**: `appName=facto-cluster` - Your existing app name

## ⚠️ Important

- The code automatically adds `/facto_app` if missing, but it's better to be explicit
- After updating Render.com, wait for backend to redeploy (2-3 minutes)
- All environments should use the **same connection string** for consistency

