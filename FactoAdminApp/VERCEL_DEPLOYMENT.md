# Vercel Deployment Configuration for Admin App

## Environment Variables Setup

To ensure the Facto Admin App on Vercel correctly connects to the production backend, you need to set the following environment variable in your Vercel project settings:

### Required Environment Variable

1. Go to your Vercel project dashboard for **FactoAdminApp**
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

### Auto-Detection

The app now automatically detects if it's running on Vercel and will use the production backend URL even if the environment variable is not set. However, it's recommended to set the environment variable explicitly for better control.

### Verify Configuration

After setting the environment variable:

1. **Redeploy** your application on Vercel
2. Check the browser console on the deployed site
3. You should see: `🌐 Admin API Base URL: https://facto-backend-api.onrender.com/api/v1`
4. Login should now work correctly

### Troubleshooting

If login is still not working:

1. **Check Network Tab**: Open browser DevTools → Network tab and verify API calls are going to `https://facto-backend-api.onrender.com/api/v1/admin/login`
2. **Check Console**: Look for CORS errors or 404 errors
3. **Verify Backend**: Ensure `https://facto-backend-api.onrender.com/api/v1` is accessible and responding
4. **Check CORS**: Ensure backend CORS settings allow requests from your Vercel domain (`facto-admin-app.vercel.app`)
5. **Verify Admin User**: Ensure admin user exists in database (run `npm run create:admin` in backend if needed)

### Current Configuration

- **Production Backend**: `https://facto-backend-api.onrender.com/api/v1`
- **Local Development**: `http://localhost:8080/api/v1` (fallback)
- **Auto-detection**: The app automatically detects if it's running on Vercel and uses the production backend

### Admin Login Credentials

Default admin credentials (if created via script):
- **Email**: `factoadmin@gmail.com`
- **Password**: `abc@12345`

To create admin user, run in backend:
```bash
cd FactoBackendServices
npm run create:admin
```

