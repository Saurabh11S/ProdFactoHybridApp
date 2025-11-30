import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy initialization - only create Razorpay instance when needed
let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file. Get your keys from: https://dashboard.razorpay.com/app/keys');
    }
    
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  
  return razorpayInstance;
}

export async function createOrder(amount: number, currency: string, receipt: string) {
  console.log('Razorpay configuration check:');
  console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set');
  console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');
  
  const options = {
    amount: amount, // amount is already in paise from the controller
    currency,
    receipt,
  };

  console.log('Creating Razorpay order with options:', options);
  console.log('Amount breakdown:');
  console.log('- Amount received (paise):', amount);
  console.log('- Amount in rupees:', amount / 100);

  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', order);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    });
    throw error;
  }
}

export async function verifyRazorpayPayment(orderId: string, paymentId: string, signature: string) {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

