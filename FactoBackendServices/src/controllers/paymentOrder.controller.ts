import { createOrder, verifyRazorpayPayment, verifyWebhookSignature, } from "@/config/razorpay";
import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { UserPurchase } from "@/models/userPurchase.model";
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "@/middlewares/auth";

// Simple test endpoint
export const testPayment = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Test payment endpoint called');
      res.status(200).json({ message: 'Payment endpoint is working!', body: req.body });
    } catch (error) {
      console.error('Test payment error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export const initiatePayment = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('\n🚀 === PAYMENT INITIATION START ===');
      console.log('📅 Timestamp:', new Date().toISOString());
      console.log('👤 User from auth middleware:', (req as any).user);
      console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
      console.log('🔗 Request URL:', req.url);
      console.log('📋 Request method:', req.method);

      const { userId, items, currency = "INR"} = req.body;

      console.log('\n📊 === EXTRACTED PAYMENT DATA ===');
      console.log('👤 User ID:', userId, '(type:', typeof userId, ')');
      console.log('🛒 Items:', JSON.stringify(items, null, 2), '(count:', items?.length, ')');
      console.log('💰 Currency:', currency);

      if (!userId || !items || items.length === 0 ) {
        console.log('\n❌ === VALIDATION FAILED ===');
        console.log('❌ User ID valid:', !!userId);
        console.log('❌ Items valid:', !!items);
        console.log('❌ Items length:', items?.length);
        return next(
            createCustomError("Invalid request body", StatusCode.BAD_REQ)
          );
      }

      // Calculate total amount (convert to paise for Razorpay)
      const amountInRupees = items.reduce(
        (total: number, item: any) => total + item.price,
        0
      );
      const amount = amountInRupees * 100; // Convert to paise for Razorpay

      console.log('\n💰 === PAYMENT CALCULATION ===');
      console.log('💵 Amount in Rupees:', amountInRupees);
      console.log('💵 Amount in Paise (for Razorpay):', amount);
      console.log('💵 Total Amount (₹):', amountInRupees);

      // Check if Razorpay is configured
      console.log('\n🔧 === RAZORPAY CONFIGURATION CHECK ===');
      console.log('🔑 RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Not set');
      console.log('🔐 RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Not set');
      
      // Create Razorpay order directly

      // Create Razorpay order
      console.log('\n🔄 === CREATING RAZORPAY ORDER ===');
      console.log('📋 Order details:', { amount, currency, userId });
      try {
        const razorpayOrder = await createOrder(amount, currency, userId);
        console.log('✅ Razorpay order created successfully:', razorpayOrder.id);
        
        // Create PaymentOrder in our database
        console.log('\n💾 === SAVING PAYMENT ORDER TO DATABASE ===');
        console.log('📊 PaymentOrder data:', {
          userId,
          amount,
          currency,
          itemsCount: items.length,
          status: "pending",
          paymentMethod: "razorpay",
          transactionId: razorpayOrder.id
        });

        const paymentOrder = new db.PaymentOrder({
          userId,
          amount: amountInRupees, // Store amount in rupees for consistency
          currency,
          items,
          status: "pending",
          paymentMethod: "razorpay",
          transactionId: razorpayOrder.id,
        });

        await paymentOrder.save();
        console.log('✅ PaymentOrder saved successfully!');
        console.log('🆔 PaymentOrder ID:', paymentOrder._id);
        console.log('🆔 Razorpay Order ID:', razorpayOrder.id);
        
        const response = sendSuccessApiResponse("Order initiated Successfully",{
          orderId: razorpayOrder.id,
          amount: amountInRupees, // Send amount in rupees
          currency: razorpayOrder.currency,
          paymentOrderId: paymentOrder._id,
          isDevelopmentMode: false,
        },200);
        res.send(response);
        return;
      } catch (razorpayError) {
        console.error('Razorpay order creation failed:', razorpayError);
        next(createCustomError(razorpayError.message, StatusCode.INT_SER_ERR));
        return;
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Provide more specific error messages
      let errorMessage = "Payment initiation failed";
      
      // Handle different error types
      if (error.statusCode === 401) {
        errorMessage = "Razorpay authentication failed. Please check your API credentials.";
      } else if (error.statusCode === 400) {
        errorMessage = "Invalid request to Razorpay. Please check your data.";
      } else if (error.error && error.error.description) {
        errorMessage = `Razorpay error: ${error.error.description}`;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = error.toString();
      }
      
      next(createCustomError(errorMessage, StatusCode.INT_SER_ERR));
    }
  }
);

export const verifyPayment = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('\n🔍 === PAYMENT VERIFICATION START ===');
      console.log('📅 Timestamp:', new Date().toISOString());
      console.log('📦 Verification request body:', JSON.stringify(req.body, null, 2));
      
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        console.log('\n❌ === MISSING VERIFICATION DATA ===');
        console.log('❌ Order ID:', !!razorpay_order_id);
        console.log('❌ Payment ID:', !!razorpay_payment_id);
        console.log('❌ Signature:', !!razorpay_signature);
        return next(
          createCustomError('Missing payment verification data', StatusCode.BAD_REQ)
        );
      }

      console.log('\n🔐 === RAZORPAY SIGNATURE VERIFICATION ===');
      console.log('🆔 Order ID:', razorpay_order_id);
      console.log('💳 Payment ID:', razorpay_payment_id);
      console.log('🔑 Signature:', razorpay_signature);
      
      const isValid = await verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  
      if (!isValid) {
        console.log('❌ Payment signature verification failed');
        return next(
          createCustomError('Invalid payment signature', StatusCode.BAD_REQ)
        );
      }

      console.log('✅ Payment signature verified successfully!');
  
      // Update PaymentOrder status
      console.log('\n💾 === UPDATING PAYMENT ORDER STATUS ===');
      console.log('🔍 Searching for PaymentOrder with transaction ID:', razorpay_order_id);
      
      const paymentOrder = await db.PaymentOrder.findOneAndUpdate(
        { transactionId: razorpay_order_id },
        { status: 'completed' },
        { new: true }
      );
  
      if (!paymentOrder) {
        console.log('❌ Payment order not found for transaction ID:', razorpay_order_id);
        return next(
          createCustomError('Payment order not found', StatusCode.NOT_FOUND)
        );
      }

      console.log('✅ PaymentOrder status updated to completed!');
      console.log('🆔 PaymentOrder ID:', paymentOrder._id);
      console.log('👤 User ID:', paymentOrder.userId);
      console.log('💰 Amount:', paymentOrder.amount);
      console.log('🛒 Items count:', paymentOrder.items.length);
  
      // Create UserPurchase records
      console.log('\n🛒 === CREATING USER PURCHASE RECORDS ===');
      console.log('📊 Processing', paymentOrder.items.length, 'items for UserPurchase creation');
      
      const userPurchases = await Promise.all(
        paymentOrder.items.map(async (item, index) => {
          console.log(`\n📦 Processing item ${index + 1}:`, {
            itemType: item.itemType,
            itemId: item.itemId,
            price: item.price,
            selectedFeatures: item.selectedFeatures,
            billingPeriod: item.billingPeriod
          });

          const purchase = new UserPurchase({
            userId: paymentOrder.userId,
            itemType: item.itemType,
            itemId: item.itemId,
            selectedFeatures: item.selectedFeatures,
            billingPeriod: item.billingPeriod,
            paymentOrderId: paymentOrder._id,
            status: 'active',
          });

          const savedPurchase = await purchase.save();
          console.log(`✅ UserPurchase ${index + 1} created successfully!`);
          console.log(`🆔 UserPurchase ID:`, savedPurchase._id);
          console.log(`👤 User ID:`, savedPurchase.userId);
          console.log(`🛍️ Item Type:`, savedPurchase.itemType);
          console.log(`🆔 Item ID:`, savedPurchase.itemId);
          console.log(`📅 Status:`, savedPurchase.status);
          
          return savedPurchase;
        })
      );
      
      console.log('\n🎉 === USER PURCHASE CREATION COMPLETE ===');
      console.log('✅ Total UserPurchases created:', userPurchases.length);
      console.log('📋 UserPurchase IDs:', userPurchases.map(p => p._id));
      
      // Get service details for the response
      const serviceDetails = await db.SubService.findOne({ serviceCode: paymentOrder.items[0]?.itemId })
        .populate('serviceId', 'title')
        .select('title description price');

      const response = sendSuccessApiResponse("Payment verified and service activated successfully", {
        paymentOrderId: paymentOrder._id,
        purchaseId: userPurchases[0]?._id,
        serviceId: paymentOrder.items[0]?.itemId,
        serviceName: serviceDetails?.title || 'Service',
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        userPurchases: userPurchases,
        message: 'Your service has been activated successfully'
      }, 200);
  
      res.send(response);
    } catch (error) {
      console.error('Error verifying payment:', error);
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
  
  export const handleWebhook = async (req: Request, res: Response,next:NextFunction) => {
    try {
      const rawBody = JSON.stringify(req.body);
      const signature = req.headers['x-razorpay-signature'] as string;
      const isValid = verifyWebhookSignature(rawBody, signature);
  
      if (!isValid) {
        return next(
            createCustomError('Invalid webhook signature', StatusCode.BAD_REQ)
          );
      }
  
      const event = req.body.event;
  
      switch (event) {
        case 'payment.captured':
          await handlePaymentCaptured(req.body.payload.payment.entity);
          break;
        case 'payment.failed':
          await handlePaymentFailed(req.body.payload.payment.entity);
          break;
        // Add more event handlers as needed
      }
  
      res.json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook handling error:', error);
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  };
  
  async function handlePaymentCaptured(payment: any) {
    const paymentOrder = await db.PaymentOrder.findOneAndUpdate(
      { transactionId: payment.order_id },
      { status: 'completed' },
      { new: true }
    );
  
    if (!paymentOrder) {
      console.error('Payment order not found for order_id:', payment.order_id);
      return;
    }
  
    // Create UserPurchase records
    await Promise.all(
      paymentOrder.items.map(async (item) => {
        const purchase = new db.UserPurchase({
          userId: paymentOrder.userId,
          itemType: item.itemType,
          itemId: item.itemId,
          paymentOrderId: paymentOrder._id,
          status: 'active',
        });
  
        // Set expiry date for services
        // if (item.itemType === 'service') {
        //   const SubService = mongoose.model('SubService');
        //   const service = await SubService.findById(item.itemId);
        //   if (service) {
        //     const now = new Date();
        //     switch (service.period) {
        //       case 'monthly':
        //         purchase.expiryDate = new Date(now.setMonth(now.getMonth() + 1));
        //         break;
        //       case 'quarterly':
        //         purchase.expiryDate = new Date(now.setMonth(now.getMonth() + 3));
        //         break;
        //       case 'half_yearly':
        //         purchase.expiryDate = new Date(now.setMonth(now.getMonth() + 6));
        //         break;
        //       case 'yearly':
        //         purchase.expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
        //         break;
        //       // For one_time, expiryDate remains undefined
        //     }
        //   }
        // }
  
        await purchase.save();
      })
    );
  }
  
  async function handlePaymentFailed(payment: any) {
    await db.PaymentOrder.findOneAndUpdate(
      { transactionId: payment.order_id },
      { status: 'failed' }
    );
    // Implement any additional logic for failed payments (e.g., notifying the user)
  }
  
  export const getAllPayments = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const payments = await db.PaymentOrder.find({})
          .sort({ createdAt: -1 }) // Sort latest first
          .populate("userId") // populate user
          // .populate("items.itemId") 
          .lean();
  
        const response = sendSuccessApiResponse("Fetched all payments", { payments }, 200);
        res.send(response);
      } catch (error) {
        console.error("Error fetching payments:", error);
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

  // Get user-specific payment orders
  export const getUserPaymentOrders = bigPromise(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?.id;

        if (!userId) {
          return next(createCustomError("User not authenticated", StatusCode.UNAUTHORIZED));
        }

        const payments = await db.PaymentOrder.find({ userId })
          .sort({ createdAt: -1 }) // Sort latest first
          .populate("userId", "fullName email phoneNumber") // populate user details
          .lean();
  
        const response = sendSuccessApiResponse("Fetched user payment orders", { data: payments }, 200);
        res.send(response);
      } catch (error) {
        console.error("Error fetching user payment orders:", error);
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

// Create a payment order (for development/testing)
export const createPaymentOrder = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, currency, status, paymentMethod, transactionId, items } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return next(createCustomError("User not authenticated", StatusCode.UNAUTHORIZED));
      }

      if (!amount || !currency || !status || !paymentMethod || !transactionId) {
        return next(createCustomError("Missing required fields", StatusCode.BAD_REQ));
      }

      const paymentOrder = new db.PaymentOrder({
        userId,
        amount,
        currency,
        status,
        paymentMethod,
        transactionId,
        items: items || []
      });

      await paymentOrder.save();

      res.status(201).json({
        success: true,
        message: 'Payment order created successfully',
        data: paymentOrder
      });
    } catch (error) {
      console.error('Create payment order error:', error);
      next(createCustomError("Failed to create payment order", StatusCode.INTERNAL_SERVER_ERROR));
    }
  }
);