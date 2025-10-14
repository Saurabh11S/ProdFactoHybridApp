# Environment Setup Guide

## Frontend Environment Variables

### 1. Create .env file in frontend root directory

Create a `.env` file in `FactoWebAppNew/FactoWebAppNew-main/` with:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_actual_razorpay_test_key_here

# Backend API URL
VITE_API_URL=http://localhost:8080/api/v1
```

### 2. Get Your Razorpay Test Key

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Login to your account
3. Go to **Settings** → **API Keys**
4. Copy your **Test Key ID** (starts with `rzp_test_`)
5. Replace `your_actual_razorpay_test_key_here` with your actual key

### 3. Restart Development Server

After creating the `.env` file:
```bash
npm start
```

## Backend Environment Variables

### 1. Create .env file in backend root directory

Create a `.env` file in `facto_backend-main/facto_backend-main/` with:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/facto_app

# Razorpay Configuration
RAZORPAY_KEY_ID=your_actual_razorpay_test_key_here
RAZORPAY_KEY_SECRET=your_actual_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Server Configuration
PORT=8080
NODE_ENV=development
```

### 2. Get Razorpay Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Login to your account
3. Go to **Settings** → **API Keys**
4. Copy your **Test Key ID** and **Test Key Secret**
5. Replace the placeholder values in the `.env` file

## How It Works

### Frontend
- Uses `import.meta.env.VITE_RAZORPAY_KEY_ID` to get the Razorpay key
- Falls back to hardcoded key if environment variable is not set
- Logs the key being used for debugging

### Backend
- Uses `process.env.RAZORPAY_KEY_ID` and `process.env.RAZORPAY_KEY_SECRET`
- Logs configuration status on startup
- Creates Razorpay orders using the configured keys

## Testing

### Test Card Numbers
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **Auth Failure**: 4000 0000 0000 0069

### Test Process
1. Start both frontend and backend servers
2. Login to the application
3. Go to any service and click "Get Quotation"
4. Click "Pay & Activate"
5. Use test card numbers in Razorpay modal

## Debugging

### Check Environment Variables
- Frontend: Check browser console for "Razorpay Key from env:" log
- Backend: Check server console for "RAZORPAY_KEY_ID: Set" log

### Common Issues
1. **Key not loading**: Check `.env` file is in correct directory
2. **Server restart needed**: Restart after creating `.env` file
3. **Wrong key format**: Ensure key starts with `rzp_test_`

## Current Status

✅ Frontend configured to use environment variables
✅ Backend ready for environment variable configuration
✅ Fallback keys provided for testing
✅ Debugging logs added
✅ Documentation created
