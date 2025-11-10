# 🚀 Run Project Locally

This guide will help you run all three applications locally:
1. **Backend** (FactoBackendServices) - Port 8080
2. **User Web App** (FactoUserWebApp) - Port 5173 (default Vite)
3. **Admin App** (FactoAdminApp) - Port 5174 (or next available)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB connection string (from Render.com or local MongoDB)

## 🔧 Step 1: Setup Environment Variables

### Backend Environment (FactoBackendServices/.env)

Create `FactoBackendServices/.env` file:

```env
# MongoDB Connection String (use production database for consistency)
MONGODB_URI=mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Secret (use a secure random string)
JWT_SECRET=your_jwt_secret_key_here

# Razorpay (if using payment)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Twilio (if using SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Frontend Environment (Root .env)

Create `.env` file in the root directory:

```env
# Backend API URL (use localhost backend)
VITE_API_URL=http://localhost:8080/api/v1

# Environment
NODE_ENV=development
```

## 📦 Step 2: Install Dependencies

### Install Backend Dependencies

```bash
cd FactoBackendServices
npm install
```

### Install User Web App Dependencies

```bash
cd FactoUserWebApp
npm install
```

### Install Admin App Dependencies

```bash
cd FactoAdminApp
npm install
```

## 🚀 Step 3: Run Applications

You'll need **3 terminal windows** (one for each app).

### Terminal 1: Backend Server

```bash
cd FactoBackendServices
npm start
```

**Expected Output:**
```
✅ MongoDB connected successfully!
🏠 Host: facto-cluster.2yoapwv.mongodb.net
🗄️ Database: facto_app
🌐 Database Type: Production (MongoDB Atlas)
🚀 Server running on port 8080
```

**Backend will be available at:** `http://localhost:8080`

### Terminal 2: User Web App

```bash
cd FactoUserWebApp
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**User Web App will be available at:** `http://localhost:5173`

### Terminal 3: Admin App

```bash
cd FactoAdminApp
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

**Admin App will be available at:** `http://localhost:5174`

## ✅ Step 4: Verify Everything is Running

### Check Backend
- Open: `http://localhost:8080/api/v1/services`
- Should return JSON response with services

### Check User Web App
- Open: `http://localhost:5173`
- Should show the home page

### Check Admin App
- Open: `http://localhost:5174`
- Should show the login page
- Login with: `factoadmin@gmail.com` / `abc@12345`

## 🔍 Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

**MongoDB Connection Failed:**
- Verify `MONGODB_URI` in `FactoBackendServices/.env`
- Ensure connection string includes `/facto_app` database name
- Check if MongoDB Atlas allows connections from your IP

### Frontend Issues

**Port already in use:**
- Vite will automatically use the next available port (5174, 5175, etc.)
- Check the terminal output for the actual port

**API Connection Errors:**
- Verify `VITE_API_URL` in root `.env` file
- Ensure backend is running on port 8080
- Check browser console for CORS errors

**Module not found errors:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📝 Quick Start Script (Windows PowerShell)

Save this as `start-all.ps1` in the root directory:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd FactoBackendServices; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 5

# Start User Web App
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd FactoUserWebApp; npm run dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start Admin App
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd FactoAdminApp; npm run dev"

Write-Host "All applications starting..."
Write-Host "Backend: http://localhost:8080"
Write-Host "User App: http://localhost:5173"
Write-Host "Admin App: http://localhost:5174"
```

Run with:
```powershell
.\start-all.ps1
```

## 🎯 Access URLs

Once everything is running:

- **Backend API:** http://localhost:8080/api/v1
- **User Web App:** http://localhost:5173
- **Admin App:** http://localhost:5174

## 📚 Additional Commands

### Verify Database Connection
```bash
cd FactoBackendServices
npm run verify:db
```

### Check Courses in Database
```bash
cd FactoBackendServices
npm run check:admin-courses
```

### Add Courses to Database
```bash
cd FactoBackendServices
npm run add:manual-courses
```

### Add Blogs to Database
```bash
cd FactoBackendServices
npm run seed:blogs
```

