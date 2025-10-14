import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

