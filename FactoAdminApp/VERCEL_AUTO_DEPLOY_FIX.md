# Fix Vercel Auto-Deployment for FactoAdminApp

## Problem
Auto-deployment is not working when pushing to Git. Vercel is not automatically deploying changes.

## Solution Steps

### Step 1: Verify Git Integration
1. Go to https://vercel.com/dashboard
2. Select your **FactoAdminApp** project
3. Go to **Settings** → **Git**
4. Verify:
   - ✅ Repository is connected: `Saurabh11S/ProdFactoHybridApp`
   - ✅ Production Branch: `master` (or `main` if that's your default)
   - ✅ Auto-deploy is **ENABLED**

### Step 2: Set Root Directory (IMPORTANT for Monorepo)
Since this is a monorepo with multiple apps, Vercel needs to know which directory to build:

1. Go to **Settings** → **General**
2. Scroll to **Root Directory**
3. Click **Edit**
4. Set Root Directory to: `FactoAdminApp`
5. Click **Save**

### Step 3: Verify Build Settings
1. Go to **Settings** → **General**
2. Scroll to **Build & Development Settings**
3. Verify:
   - **Framework Preset**: Vite (or Auto-detect)
   - **Root Directory**: `FactoAdminApp`
   - **Build Command**: `npm ci && npm run build` (or leave empty to use vercel.json)
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci` (or leave empty)

### Step 4: Check Deployment Hooks
1. Go to **Settings** → **Git**
2. Scroll to **Deployment Hooks**
3. Verify webhook URL is present
4. If missing, click **Reconnect** or **Connect Git Repository**

### Step 5: Test Auto-Deployment
1. Make a small change to any file in FactoAdminApp
2. Commit and push to Git:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push
   ```
3. Go to Vercel Dashboard → **Deployments**
4. You should see a new deployment starting automatically within 30 seconds

### Step 6: If Still Not Working - Manual Fix

#### Option A: Reconnect Git Repository
1. Go to **Settings** → **Git**
2. Click **Disconnect** (if connected)
3. Click **Connect Git Repository**
4. Select your repository: `Saurabh11S/ProdFactoHybridApp`
5. Configure:
   - **Root Directory**: `FactoAdminApp`
   - **Production Branch**: `master`
6. Click **Deploy**

#### Option B: Check Branch Protection
1. Go to **Settings** → **Git**
2. Check if branch protection is enabled
3. If enabled, ensure your branch (`master`) is not protected or add it to allowed branches

#### Option C: Verify Webhook in GitHub
1. Go to GitHub: https://github.com/Saurabh11S/ProdFactoHybridApp/settings/hooks
2. Look for Vercel webhook
3. If missing or failed, go back to Vercel and reconnect

### Step 7: Verify Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Ensure `VITE_API_URL` is set for Production, Preview, and Development
3. Value: `https://facto-backend-api.onrender.com/api/v1`

## Quick Checklist
- [ ] Git repository is connected
- [ ] Root Directory is set to `FactoAdminApp`
- [ ] Production branch is `master`
- [ ] Auto-deploy is enabled
- [ ] Build settings are correct
- [ ] Environment variables are set
- [ ] Webhook exists in GitHub

## After Fixing
1. Make a test commit and push
2. Watch Vercel dashboard for automatic deployment
3. Deployment should start within 30-60 seconds of push

## Still Not Working?
1. Check Vercel logs for errors
2. Verify GitHub webhook is receiving events
3. Try manual redeploy first
4. Contact Vercel support if issue persists

