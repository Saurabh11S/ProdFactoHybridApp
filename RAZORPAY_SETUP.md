# 🔧 Razorpay Payment Gateway Setup Guide

## Issue
The payment gateway is not working because Razorpay keys are not configured in the backend environment.

## Solution

### Step 1: Get Your Razorpay Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Sign in to your Razorpay account
3. Navigate to **Settings** → **API Keys**
4. You'll see:
   - **Key ID** (starts with `rzp_test_` for test mode or `rzp_live_` for production)
   - **Key Secret** (click "Reveal" to see it)

### Step 2: Configure Backend Environment

1. Open `FactoBackendServices/.env` file
2. Find the Razorpay configuration section (around line 15-18)
3. Uncomment and update these lines:

```env
# Razorpay Configuration (Required for payment processing)        
# Get these from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
```

**Replace:**
- `rzp_test_xxxxxxxxxxxxx` with your actual Key ID
- `your_razorpay_secret_key_here` with your actual Key Secret

### Step 3: Restart Backend Server

After updating the `.env` file:

```bash
cd FactoBackendServices
# Stop the current server (Ctrl+C)
npm start
```

### Step 4: Verify Configuration

1. Try making a payment again
2. Check the backend console logs - you should see:
   ```
   🔑 RAZORPAY_KEY_ID: ✅ Set
   🔐 RAZORPAY_KEY_SECRET: ✅ Set
   ```

## Test Mode vs Production Mode

### Test Mode (Development)
- Use keys starting with `rzp_test_`
- Payments are simulated (no real money)
- Perfect for testing

### Production Mode (Live)
- Use keys starting with `rzp_live_`
- Real payments are processed
- Switch to production keys only when ready to go live

## Troubleshooting

### Error: "Razorpay is not configured"
- ✅ Check that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are uncommented in `.env`
- ✅ Verify there are no extra spaces around the `=` sign
- ✅ Make sure you restarted the backend server after changes
- ✅ Check that the keys are correct (copy-paste from Razorpay dashboard)

### Error: "Invalid API key"
- ✅ Verify you're using the correct Key ID and Key Secret
- ✅ Make sure you're using test keys for test mode and live keys for production
- ✅ Check if the keys have expired (regenerate if needed)

### Payment Gateway Opens But Payment Fails
- ✅ Check Razorpay dashboard for error logs
- ✅ Verify your Razorpay account is activated
- ✅ Check if test mode is enabled in Razorpay dashboard (for test keys)

## Additional Notes

- The frontend will automatically receive the Razorpay Key ID from the backend API
- You can also set `VITE_RAZORPAY_KEY_ID` in the frontend `.env` as a fallback
- Never commit your `.env` file to git (it's already in `.gitignore`)

## Support

If you continue to face issues:
1. Check Razorpay dashboard for account status
2. Review backend console logs for detailed error messages
3. Contact Razorpay support: https://razorpay.com/support/

