# Fix Admin Login Timeout Issue

## Problem
Admin login is timing out with error: `timeout of 30000ms exceeded`

## Root Cause
The backend server on port 8080 is not responding to requests, likely due to:
1. Backend process hanging or crashed
2. Database connection issues
3. Backend taking too long to process requests

## Solutions

### Solution 1: Restart Backend Server (Recommended)

1. **Stop the current backend process:**
   ```powershell
   # Find the process ID (PID) using port 8080
   netstat -ano | findstr :8080
   
   # Kill the process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

2. **Navigate to backend directory:**
   ```powershell
   cd FactoBackendServices
   ```

3. **Start the backend server:**
   ```powershell
   npm start
   ```

4. **Verify backend is running:**
   - Check console for: `✅ Server is running at http://0.0.0.0:8080`
   - Test health endpoint: Open browser to `http://localhost:8080/api/v1/`

### Solution 2: Check Database Connection

The backend might be hanging on database connection. Check:

1. **Verify MongoDB connection:**
   - Check `.env` file has correct `MONGODB_URI`
   - Ensure MongoDB is running
   - Check backend console for database connection errors

2. **Test database connection:**
   ```powershell
   cd FactoBackendServices
   node verify-database-connection.js
   ```

### Solution 3: Increase Timeout (Temporary Fix)

If backend is slow but working, increase timeout in admin app:

1. **Edit:** `FactoAdminApp/src/config/axiosConfig.ts`
2. **Change:** `timeout: 30000` to `timeout: 60000` (60 seconds)

### Solution 4: Check Backend Logs

1. **Check backend console** for errors:
   - Database connection errors
   - Missing environment variables
   - Port already in use errors

2. **Common issues:**
   - Missing `.env` file
   - Wrong `MONGODB_URI`
   - Port 8080 already in use
   - Database server not running

## Quick Diagnostic Steps

1. **Check if backend is listening:**
   ```powershell
   netstat -ano | findstr :8080
   ```
   Should show `LISTENING` status

2. **Test backend health:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:8080/api/v1/" -Method GET
   ```
   Should return JSON response

3. **Check backend process:**
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*node*"}
   ```

## Prevention

1. **Always check backend console** before using admin app
2. **Verify database connection** is working
3. **Check environment variables** are set correctly
4. **Monitor backend logs** for errors

## After Fixing

1. Restart admin app development server
2. Try logging in again
3. Check browser console for any remaining errors

