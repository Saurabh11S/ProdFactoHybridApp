# Razorpay Configuration

## Current Configuration

The Razorpay test key is now configured to use environment variables in `src/components/ServiceDetailsPage.tsx`:

### Development Mode (Line 866):
```javascript
key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RH6v2Ap0TDGOmM', // Use environment variable or fallback
```

### Production Mode (Line 959):
```javascript
key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RH6v2Ap0TDGOmM', // Use environment variable or fallback
```

## How to Configure with Environment Variables

### Option 1: Create .env file (Recommended)
Create a `.env` file in the frontend root directory:
```env
VITE_RAZORPAY_KEY_ID=your_actual_razorpay_test_key
VITE_API_URL=http://localhost:8080/api/v1
```

### Option 2: Update the code directly
Replace the fallback key `rzp_test_RH6v2Ap0TDGOmM` with your actual test key in both locations

## Environment Variable Setup

1. Get your Razorpay test key from [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create a `.env` file in the frontend root directory
3. Add `VITE_RAZORPAY_KEY_ID=your_actual_key_here`
4. Restart your development server

## Test Card Numbers

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **Auth Failure**: 4000 0000 0000 0069

## Environment Variables (Optional)

You can also use environment variables by:

1. Creating a `.env` file in the root directory
2. Adding: `REACT_APP_RAZORPAY_KEY_ID=your_key_here`
3. Updating the code to use: `process.env.REACT_APP_RAZORPAY_KEY_ID`

## Current Status

✅ Frontend configured with Razorpay test key
✅ Backend ready for Razorpay integration
✅ Test payment flow implemented
✅ Error handling added

## Next Steps

1. Replace the test key with your actual Razorpay test key
2. Create `.env` file in backend with your Razorpay credentials
3. Test the payment flow
4. Switch to production mode when ready
