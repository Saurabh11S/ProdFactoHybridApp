# 🔧 Render Build Error Fix

## ❌ Error Message

```
npm error Missing script: "build-ts:prodyarn"
```

## 🔍 Problem

The build command in Render dashboard has a typo. It's trying to run `build-ts:prodyarn` instead of `build-ts:prod`.

## ✅ Solution

### Step 1: Fix Build Command in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service: `facto-backend-api`
3. Go to **"Settings"** tab
4. Scroll to **"Build & Deploy"** section
5. Find **"Build Command"** field
6. **Replace** the current command with:

```bash
npm install && npm run build-ts:prod
```

**⚠️ Make sure there are NO typos:**
- ✅ Correct: `build-ts:prod`
- ❌ Wrong: `build-ts:prodyarn`
- ❌ Wrong: `build-ts:prodyarn install`
- ❌ Wrong: `build-ts:prod yarn`

### Step 2: Verify Start Command

Also verify the **"Start Command"** is:

```bash
npm run start:prod
```

### Step 3: Fix NODE_ENV Mismatch

**Important:** The `start:prod` script uses `NODE_ENV=prod` but you should set `NODE_ENV=production` in Render environment variables.

**Option A: Update Environment Variable (Recommended)**
1. Go to **"Environment"** tab in Render
2. Find `NODE_ENV` variable
3. Change value from `production` to `prod`
4. OR keep it as `production` and update the start command (see Option B)

**Option B: Update Start Command**
Change start command to:
```bash
NODE_ENV=production npm run start:prod
```

**Recommended:** Use Option A - set `NODE_ENV=prod` in environment variables to match the script.

### Step 4: Save and Redeploy

1. Click **"Save Changes"** at the bottom
2. Render will automatically trigger a new deployment
3. Monitor the **"Logs"** tab to verify the build succeeds

---

## 📋 Complete Render Configuration

### Build Command
```bash
npm install && npm run build-ts:prod
```

### Start Command
```bash
npm run start:prod
```

### Root Directory
```
FactoBackendServices
```

### Environment Variables
```env
NODE_ENV=prod
PORT=8080
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
# ... other variables
```

---

## 🐛 Additional Troubleshooting

### If Build Still Fails

1. **Check npm audit warnings:**
   - These are warnings, not errors
   - You can ignore them or run `npm audit fix` locally
   - Render will still build successfully

2. **Check TypeScript compilation:**
   - Verify `tsconfig.release.json` exists
   - Check for TypeScript errors in logs

3. **Check memory issues:**
   - The build script uses `--max-old-space-size=2048`
   - If build fails due to memory, Render should handle it automatically

4. **Verify package.json:**
   - Ensure `build-ts:prod` script exists
   - Ensure `start:prod` script exists
   - Ensure all dependencies are listed

### Common Mistakes to Avoid

❌ **Don't use:**
- `yarn` (use `npm`)
- `build-ts:prodyarn`
- `npm run build-ts:prod yarn`
- Missing `npm install` before build

✅ **Do use:**
- `npm install && npm run build-ts:prod`
- Exact script name: `build-ts:prod`
- `npm run start:prod` for start command

---

## ✅ Verification Checklist

After fixing, verify:

- [ ] Build command is exactly: `npm install && npm run build-ts:prod`
- [ ] Start command is exactly: `npm run start:prod`
- [ ] Root directory is: `FactoBackendServices`
- [ ] `NODE_ENV` is set to `prod` (or update start command)
- [ ] All environment variables are set
- [ ] Build completes successfully in logs
- [ ] Service starts without errors

---

## 📞 Still Having Issues?

1. Check **"Logs"** tab for detailed error messages
2. Verify all scripts exist in `package.json`
3. Ensure `tsconfig.release.json` exists
4. Check Render status page: https://status.render.com

---

**Last Updated:** [Current Date]

