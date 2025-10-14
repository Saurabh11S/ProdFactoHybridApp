# Database Verification Guide

## 🎯 How to Verify Services are Being Saved

### **Step 1: Check Console Logs**
When you click "Pay & Activate", you should see these logs in your backend console:

```
🚀 === PAYMENT INITIATION START ===
📅 Timestamp: [timestamp]
👤 User from auth middleware: [user object]
📦 Request body: [payment data]

📊 === EXTRACTED PAYMENT DATA ===
👤 User ID: [user_id]
🛒 Items: [items array]
💰 Currency: INR

💰 === PAYMENT CALCULATION ===
💵 Total Amount: [amount] paise
💵 Total Amount (₹): [amount/100]

🔧 === RAZORPAY CONFIGURATION CHECK ===
🔑 RAZORPAY_KEY_ID: ✅ Set
🔐 RAZORPAY_KEY_SECRET: ✅ Set

🔄 === CREATING RAZORPAY ORDER ===
✅ Razorpay order created successfully: [order_id]

💾 === SAVING PAYMENT ORDER TO DATABASE ===
✅ PaymentOrder saved successfully!
🆔 PaymentOrder ID: [payment_order_id]
🆔 Razorpay Order ID: [razorpay_order_id]

🔍 === PAYMENT VERIFICATION START ===
🔐 === RAZORPAY SIGNATURE VERIFICATION ===
✅ Payment signature verified successfully!

💾 === UPDATING PAYMENT ORDER STATUS ===
✅ PaymentOrder status updated to completed!

🛒 === CREATING USER PURCHASE RECORDS ===
✅ UserPurchase 1 created successfully!
🆔 UserPurchase ID: [user_purchase_id]
👤 User ID: [user_id]
🛍️ Item Type: service
🆔 Item ID: [service_id]
📅 Status: active

🎉 === USER PURCHASE CREATION COMPLETE ===
✅ Total UserPurchases created: 1
```

### **Step 2: Check Database Tables**

#### **Primary Tables to Check:**

1. **`PaymentOrder` Collection**
   - **Purpose**: Stores payment transaction details
   - **Key Fields**: `userId`, `amount`, `currency`, `items`, `status`, `transactionId`
   - **Status Values**: `pending` → `completed`
   - **Query**: `db.PaymentOrder.find({userId: "your_user_id"})`

2. **`UserPurchase` Collection**
   - **Purpose**: Stores user's purchased services
   - **Key Fields**: `userId`, `itemType`, `itemId`, `status`, `paymentOrderId`
   - **Status Values**: `active`, `expired`, `cancelled`
   - **Query**: `db.UserPurchase.find({userId: "your_user_id"})`

3. **`User` Collection**
   - **Purpose**: User account information
   - **Key Fields**: `_id`, `email`, `fullName`, `phoneNumber`
   - **Query**: `db.User.find({email: "user@example.com"})`

#### **Secondary Tables (Optional):**

4. **`SubService` Collection**
   - **Purpose**: Service details and pricing
   - **Key Fields**: `_id`, `title`, `description`, `price`, `serviceId`
   - **Query**: `db.SubService.find({_id: "service_id"})`

5. **`Service` Collection**
   - **Purpose**: Main service categories
   - **Key Fields**: `_id`, `title`, `description`
   - **Query**: `db.Service.find({})`

### **Step 3: MongoDB Queries to Run**

#### **Check if Payment was Created:**
```javascript
// Find all payment orders for a user
db.PaymentOrder.find({userId: ObjectId("your_user_id")}).sort({createdAt: -1})

// Find recent payment orders
db.PaymentOrder.find({}).sort({createdAt: -1}).limit(5)
```

#### **Check if UserPurchase was Created:**
```javascript
// Find all user purchases for a user
db.UserPurchase.find({userId: ObjectId("your_user_id")}).sort({createdAt: -1})

// Find active purchases only
db.UserPurchase.find({userId: ObjectId("your_user_id"), status: "active"})
```

#### **Check User Information:**
```javascript
// Find user by email
db.User.find({email: "user@example.com"})

// Find user by ID
db.User.find({_id: ObjectId("your_user_id")})
```

#### **Check Service Details:**
```javascript
// Find all services
db.SubService.find({})

// Find specific service
db.SubService.find({_id: ObjectId("service_id")})
```

### **Step 4: Expected Data Flow**

1. **Payment Initiation** → Creates record in `PaymentOrder` with status `pending`
2. **Payment Verification** → Updates `PaymentOrder` status to `completed`
3. **Service Activation** → Creates record(s) in `UserPurchase` with status `active`

### **Step 5: Troubleshooting**

#### **If PaymentOrder is not created:**
- Check database connection logs
- Verify Razorpay configuration
- Check request validation

#### **If UserPurchase is not created:**
- Check if PaymentOrder status is `completed`
- Verify UserPurchase model validation
- Check for database errors in console

#### **If data exists but frontend shows error:**
- Check API response format
- Verify frontend error handling
- Check network requests in browser dev tools

### **Step 6: Quick Verification Commands**

```bash
# Start your backend server and watch logs
npm start

# In another terminal, check MongoDB
mongosh
use facto_app
db.PaymentOrder.find({}).sort({createdAt: -1}).limit(1)
db.UserPurchase.find({}).sort({createdAt: -1}).limit(1)
```

## 🎯 Success Indicators

✅ **PaymentOrder created** with status `pending`  
✅ **PaymentOrder updated** to status `completed`  
✅ **UserPurchase created** with status `active`  
✅ **Console logs show** all steps completed successfully  
✅ **Frontend shows** success message  

## ❌ Failure Indicators

❌ **No PaymentOrder created** - Check database connection  
❌ **PaymentOrder stuck** in `pending` status - Check payment verification  
❌ **No UserPurchase created** - Check UserPurchase model  
❌ **Console shows errors** - Check error messages  
❌ **Frontend shows error** - Check API responses  

