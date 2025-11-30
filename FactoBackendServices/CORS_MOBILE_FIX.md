# CORS Fix for Mobile App Login

## Problem
Mobile app login was failing with CORS error:
```
Access to XMLHttpRequest at 'https://facto-backend-api.onrender.com/api/v1/auth/login' 
from origin 'https://localhost' has been blocked by CORS policy
```

## Solution
Updated backend CORS configuration to allow Capacitor mobile app origins.

## Changes Made
File: `FactoBackendServices/src/app.ts`

### Added Capacitor Origins to CORS Whitelist:
- `https://localhost` (Capacitor default)
- `capacitor://localhost`
- `ionic://localhost`
- Regex patterns for variations

## Deployment Steps

### 1. Commit and Push Backend Changes
```bash
cd FactoBackendServices
git add src/app.ts
git commit -m "Fix CORS: Allow Capacitor mobile app origins"
git push origin main
```

### 2. Render.com Auto-Deploy
- Render.com will automatically detect the push
- It will rebuild and redeploy your backend
- This usually takes 2-5 minutes

### 3. Verify Deployment
After deployment, test login from mobile app:
- Open mobile app
- Try logging in with `pp@gmail.com` and `abc@12345`
- Check if CORS error is resolved

## Alternative: Quick Test (If You Have Backend Access)

If you can access your backend directly, you can test the CORS fix by:

1. Making a test request from the mobile app
2. Checking the response headers for `Access-Control-Allow-Origin`
3. It should include `https://localhost`

## What Changed

### Before:
- Only allowed Vercel domains and `facto.org.in`
- Mobile app origin `https://localhost` was blocked

### After:
- Allows all previous origins PLUS:
  - `https://localhost` (Capacitor)
  - `capacitor://localhost`
  - `ionic://localhost`
  - File protocol origins

## Testing

After deployment, the login should work. The backend will now accept requests from:
- ✅ Web apps (Vercel, facto.org.in)
- ✅ Mobile apps (Capacitor origins)
- ✅ Development (localhost)

## Notes

- The CORS fix is backward compatible
- No changes needed to the mobile app
- The backend will automatically allow mobile app requests after deployment

