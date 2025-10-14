# Testing Guide for Service Purchase Flow

## Overview
This guide explains how to test the complete service purchase flow after the recent fixes.

## What Was Fixed

### 1. Backend Changes
- **Created UserPurchase Controller**: Handles service purchase creation and retrieval
- **Created UserPurchase Routes**: `/api/v1/user-purchases` endpoints
- **Added Payment Order Creation**: `/api/v1/payment-orders` endpoint for development mode
- **Updated Routes**: Added user purchase routes to main router

### 2. Frontend Changes
- **Fixed Development Mode**: Now saves service purchases to database
- **Added Payment Order Creation**: Creates payment order before saving purchase
- **Updated Navigation**: Redirects to profile page after successful payment
- **Fixed TypeScript Errors**: Added 'profile' to PageType

## Testing Steps

### 1. Start Backend Server
```bash
cd facto_backend-main/facto_backend-main
npm start
```

### 2. Start Frontend Server
```bash
cd FactoWebAppNew/FactoWebAppNew-main
npm start
```

### 3. Test Service Purchase Flow

#### Step 1: Login
1. Go to the application
2. Click "Login" and enter credentials
3. Verify you're logged in

#### Step 2: Purchase a Service
1. Navigate to "Services" page
2. Click on any service (all are now ₹1 for testing)
3. Click "Get Quotation"
4. Fill in the form (if required)
5. Click "Pay & Activate"
6. Complete the Razorpay payment (use test card: 4111 1111 1111 1111)

#### Step 3: Verify Service Purchase
1. After successful payment, you should be redirected to Profile page
2. Click on "My Services" tab
3. You should see the purchased service with:
   - Service name and description
   - Price (₹1)
   - Payment status (Paid)
   - Purchase date
   - Selected features (if any)

#### Step 4: Check Payment History
1. Click on "Payments" tab
2. You should see the payment transaction with:
   - Payment amount (₹1)
   - Payment status (Completed)
   - Transaction ID
   - Payment method

## Expected Results

### After Successful Payment:
- ✅ Service appears in "My Services" tab
- ✅ Payment appears in "Payments" tab
- ✅ Summary statistics update (Total Services: 1, Total Payments: 1, Total Spent: ₹1)
- ✅ Service shows as "Paid" status
- ✅ All data persists on page refresh

### Database Records:
- **PaymentOrder**: Contains payment details
- **UserPurchase**: Contains service purchase details
- **User**: Links to both records

## Troubleshooting

### If Services Don't Appear:
1. Check browser console for errors
2. Verify backend server is running
3. Check network tab for failed API calls
4. Ensure user is logged in with valid token

### Common Issues:
1. **CORS Error**: Make sure backend allows frontend origin
2. **Authentication Error**: Check if auth token is valid
3. **Database Error**: Verify MongoDB connection
4. **API Error**: Check backend logs for errors

### Debug Information:
- Frontend logs: Check browser console
- Backend logs: Check terminal where backend is running
- Network requests: Check browser Network tab
- Database: Check MongoDB for new records

## API Endpoints Used

### Frontend Calls:
- `POST /api/v1/payment-orders` - Create payment order
- `POST /api/v1/user-purchases` - Save service purchase
- `GET /api/v1/user-purchases` - Get user purchases
- `GET /api/v1/payment-orders` - Get payment history

### Backend Endpoints:
- `POST /api/v1/payment/payment-orders` - Create payment order
- `POST /api/v1/user-purchases` - Create user purchase
- `GET /api/v1/user-purchases` - Get user purchases
- `GET /api/v1/payment/getAllPayments` - Get all payments

## Test Data

### Test Card Numbers:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **Auth Failure**: 4000 0000 0000 0069

### Service Prices:
- All services are set to ₹1 for testing
- Easy to verify payment amounts
- Low cost for multiple tests

## Next Steps

After successful testing:
1. Change `isDevelopmentMode` to `false` in ServiceDetailsPage.tsx
2. Update service prices to actual values
3. Test with real Razorpay keys
4. Deploy to production

## Files Modified

### Backend:
- `src/controllers/userPurchase.controller.ts` (new)
- `src/routes/v1/userPurchase.route.ts` (new)
- `src/controllers/paymentOrder.controller.ts` (updated)
- `src/routes/v1/paymnt.route.ts` (updated)
- `src/routes/v1/index.ts` (updated)

### Frontend:
- `src/components/ServiceDetailsPage.tsx` (updated)
- `src/components/UserProfile.tsx` (updated)
- `src/components/ServicesPage.tsx` (updated)

The service purchase flow should now work correctly, with services appearing in the user profile after successful payment!



