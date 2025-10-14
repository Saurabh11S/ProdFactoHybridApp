# Environment Setup for Backend

## Required Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/facto_app

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_RH6v2Ap0TDGOmM
RAZORPAY_KEY_SECRET=qWBWyBxMQbjo10g2t8CVMv5h
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Server Configuration
PORT=8080
NODE_ENV=development

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## How to Get Razorpay Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Login to your account
3. Go to **Settings** → **API Keys**
4. Copy your **Test Key ID** and **Test Key Secret**
5. Replace the values in the `.env` file

## Frontend Configuration

The frontend is already configured with the Razorpay test key in:
- `src/components/ServiceDetailsPage.tsx` (Line 866 and 959)

## Testing

Use these test card numbers:
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

## Notes

- The test key works only in test mode
- No real money will be charged
- All test payments are automatically successful
- Use live keys only for production
