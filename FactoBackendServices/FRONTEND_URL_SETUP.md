# FRONTEND_URL Environment Variable Setup

## What is FRONTEND_URL?

`FRONTEND_URL` is used to generate links in email notifications (blogs, courses, unsubscribe links) that point back to your frontend application.

## Where FRONTEND_URL is Used

1. **Blog Newsletter Emails** - Links to blog posts
2. **Course Newsletter Emails** - Links to course pages
3. **Unsubscribe Links** - Links for users to unsubscribe from newsletter

## Where to Set FRONTEND_URL

### 1. **Render (Production Backend)**

Since your backend is deployed on Render, you need to set this in Render's environment variables:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **Backend Service** (facto-backend-api)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://facto.org.in`
6. Click **Save Changes**
7. **Redeploy** your service for changes to take effect

### 2. **Local Development (.env file)**

For local development, add to your `.env` file in `FactoBackendServices/`:

```env
FRONTEND_URL=http://localhost:3000
```

Or if testing with production frontend:

```env
FRONTEND_URL=https://facto.org.in
```

## Current Default Value

If `FRONTEND_URL` is not set, the code defaults to:
- **Blog URLs**: `https://facto.org.in`
- **Course URLs**: `https://facto.org.in`
- **Unsubscribe Links**: `https://facto.org.in`

## Verification

After setting the environment variable:

1. **Check Render Logs**: When creating a blog, you should see in logs:
   ```
   🔗 Blog URL: https://facto.org.in/blogs/[blog-id]
   ```

2. **Test Email**: Create a test blog and check the email links point to the correct domain

## Important Notes

- ✅ Set `FRONTEND_URL=https://facto.org.in` in **Render Environment Variables**
- ✅ The value should NOT have a trailing slash (use `https://facto.org.in` not `https://facto.org.in/`)
- ✅ After updating in Render, you must **redeploy** the service
- ✅ This affects all new emails sent after the update

## Quick Setup Steps

1. **Render Dashboard** → Your Backend Service
2. **Environment** tab
3. **Add Environment Variable**:
   - Key: `FRONTEND_URL`
   - Value: `https://facto.org.in`
4. **Save Changes**
5. **Manual Deploy** → **Deploy latest commit** (or wait for auto-deploy)

That's it! All future email notifications will use `https://facto.org.in` for links.

