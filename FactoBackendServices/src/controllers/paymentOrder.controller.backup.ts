import { createOrder, verifyRazorpayPayment, verifyWebhookSignature, } from "@/config/razorpay";
import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Request, Response } from "express";

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
      console.log('=== PAYMENT INITIATION START ===');
      console.log('Received payment initiation request:');
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
      console.log('Body type:', typeof req.body);
      console.log('Body keys:', Object.keys(req.body || {}));
      console.log('Request method:', req.method);
      console.log('Request URL:', req.url);
      console.log('User from auth middleware:', (req as any).user);

      const { userId, items, currency = "INR"} = req.body;

      console.log('Extracted data:');
      console.log('userId:', userId, 'type:', typeof userId);
      console.log('items:', items, 'type:', typeof items, 'length:', items?.length);
      console.log('currency:', currency);

      if (!userId || !items || items.length === 0 ) {
        console.log('Validation failed:');
        console.log('userId valid:', !!userId);
        console.log('items valid:', !!items);
        console.log('items length:', items?.length);
        return next(
            createCustomError("Invalid request body", StatusCode.BAD_REQ)
          );
      }

      // Calculate total amount
      const amount = items.reduce(
        (total: number, item: any) => total + item.price,
        0
      );

      // Check if Razorpay is configured
      console.log('Checking Razorpay configuration:');
      console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set');
      console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');
      console.log('Actual values:');
      console.log('RAZORPAY_KEY_ID value:', process.env.RAZORPAY_KEY_ID);
      console.log('RAZORPAY_KEY_SECRET value:', process.env.RAZORPAY_KEY_SECRET);
      
      // Create Razorpay order directly

      // Create Razorpay order
      console.log('Creating Razorpay order with:', { amount, currency, userId });
      try {
        const razorpayOrder = await createOrder(amount, currency, userId);
        console.log('Razorpay order created:', razorpayOrder);
        
        // Create PaymentOrder in our database
        const paymentOrder = new db.PaymentOrder({
          userId,
          amount,
          currency,
          items,
          status: "pending",
          paymentMethod: "razorpay",
          transactionId: razorpayOrder.id,
        });

        await paymentOrder.save();
        console.log('Payment order saved:', paymentOrder);
        
        const response = sendSuccessApiResponse("Order initiated Successfully",{
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
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
      console.log('=== PAYMENT VERIFICATION START ===');
      console.log('Verification request body:', req.body);
      
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(
          createCustomError('Missing payment verification data', StatusCode.BAD_REQ)
        );
      }

      console.log('Verifying payment with Razorpay...');
      const isValid = await verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  
      if (!isValid) {
        console.log('Payment signature verification failed');
        return next(
          createCustomError('Invalid payment signature', StatusCode.BAD_REQ)
        );
      }

      console.log('Payment signature verified successfully');
  
      // Update PaymentOrder status
      const paymentOrder = await db.PaymentOrder.findOneAndUpdate(
        { transactionId: razorpay_order_id },
        { status: 'completed' },
        { new: true }
      );
  
      if (!paymentOrder) {
        console.log('Payment order not found for transaction ID:', razorpay_order_id);
        return next(
          createCustomError('Payment order not found', StatusCode.NOT_FOUND)
        );
      }

      console.log('Payment order updated:', paymentOrder._id);
  
      // Create UserPurchase records
      const userPurchases = await Promise.all(
        paymentOrder.items.map(async (item) => {
          const purchase = new db.UserPurchase({
            userId: paymentOrder.userId,
            itemType: item.itemType,
            itemId: item.itemId,
            selectedFeatures: item.selectedFeatures,
            billingPeriod: item.billingPeriod,
            paymentOrderId: paymentOrder._id,
            status: 'active',
          });
  
          return purchase.save();
        })
      );
      
      console.log('User purchases created:', userPurchases.length);
      const response = sendSuccessApiResponse("Payment verified and purchases recorded", {
        paymentOrderId: paymentOrder._id,
        userPurchases: userPurchases
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

