# Vercel Deployment Configuration

## Environment Variables Setup

To ensure the Facto User Web App on Vercel correctly connects to the production backend, you need to set the following environment variable in your Vercel project settings:

### Required Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

```
VITE_API_URL = https://facto-backend-api.onrender.com/api/v1
```

### For All Environments

Make sure to set this variable for:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### Alternative: Update vercel.json

The `vercel.json` file already includes the environment variable, but Vercel may require it to be set in the dashboard as well.

### Verify Configuration

After setting the environment variable:

1. **Redeploy** your application on Vercel
2. Check the browser console on the deployed site
3. You should see: `🌐 API Base URL: https://facto-backend-api.onrender.com/api/v1`

### Troubleshooting

If data is still not loading:

1. **Check Network Tab**: Open browser DevTools → Network tab and verify API calls are going to the correct URL
2. **Check Console**: Look for CORS errors or 404 errors
3. **Verify Backend**: Ensure `https://facto-backend-api.onrender.com/api/v1` is accessible and responding
4. **Check CORS**: Ensure backend CORS settings allow requests from your Vercel domain

### Current Configuration

- **Production Backend**: `https://facto-backend-api.onrender.com/api/v1`
- **Local Development**: `http://localhost:8080/api/v1` (fallback)
- **Auto-detection**: The app automatically detects if it's running on Vercel and uses the production backend

