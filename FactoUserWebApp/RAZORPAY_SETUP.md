# Razorpay Setup Instructions

## Step 1: Get Your Razorpay Test Key

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Login to your account
3. Go to **Settings** → **API Keys**
4. Copy your **Test Key ID** (starts with `rzp_test_`)

## Step 2: Update the Code

Replace `rzp_test_RH6v2Ap0TDGOmM` in the following files:

### File: `src/components/ServiceDetailsPage.tsx`

**Line 866** (Development Mode):
```javascript
key: 'rzp_test_RH6v2Ap0TDGOmM', // Razorpay test key - replace with your actual key
```

**Line 959** (Production Mode):
```javascript
key: 'rzp_test_RH6v2Ap0TDGOmM', // Razorpay test key - replace with your actual key
```

### Backend Environment Variables

Create a `.env` file in the backend root directory:
```env
RAZORPAY_KEY_ID=rzp_test_RH6v2Ap0TDGOmM
RAZORPAY_KEY_SECRET=qWBWyBxMQbjo10g2t8CVMv5h
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 3: Test the Payment

1. Start your development server: `npm start`
2. Login to the application
3. Go to any service and click "Get Quotation"
4. Click "Pay & Activate"
5. Use Razorpay test card numbers:
   - **Card Number**: 4111 1111 1111 1111
   - **Expiry**: Any future date
   - **CVV**: Any 3 digits
   - **Name**: Any name

## Step 4: Switch to Production Mode (Optional)

When you're ready to use the backend integration:

1. Change `isDevelopmentMode = false` in the code
2. Make sure your backend is running
3. Update the backend with your Razorpay credentials

## Test Card Numbers

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **Auth Failure**: 4000 0000 0000 0069

## Notes

- The test key works only in test mode
- No real money will be charged
- All test payments are automatically successful
- Use your live key only for production
