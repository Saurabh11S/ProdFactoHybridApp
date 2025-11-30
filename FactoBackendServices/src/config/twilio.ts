import twilio from "twilio";
import { configDotenv } from "dotenv";
import path from "path";
configDotenv({ path: path.join(__dirname, '../../.env') })

console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set');
console.log('TWILIO_SERVICE_SID:', process.env.TWILIO_SERVICE_SID ? 'Set' : 'Not set');

// Lazy initialization - only create Twilio client when needed
let twilioClient: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env file');
    }
    
    twilioClient = twilio(accountSid, authToken);
  }
  
  return twilioClient;
}

function getTwilioServiceSid() {
  const serviceSid = process.env.TWILIO_SERVICE_SID;
  if (!serviceSid) {
    throw new Error('Twilio Service SID is not configured. Please set TWILIO_SERVICE_SID in your .env file');
  }
  return serviceSid;
}

/**
 * Sends an OTP to the provided phone number.
 * @param phoneNumber - The phone number to send the OTP to (E.164 format).
 * @returns A Promise indicating the success or failure of the OTP send operation.
 */
export const sendOTP = async (phoneNumber: string): Promise<any> => {
  try {
    const client = getTwilioClient();
    const serviceSid = getTwilioServiceSid();
    
    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    return { success:true };
  } catch (error) {
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

export const verifyOTP = async (
  phoneNumber: string,
  otp: string
): Promise<string> => {
  try {
    const client = getTwilioClient();
    const serviceSid = getTwilioServiceSid();
    
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code: otp });

    if (verificationCheck.status === "approved") {
      return "approved"
    } else {
      throw new Error(`Invalid OTP. Status: ${verificationCheck.status}`);
    }
  } catch (error) {
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
};

/**
 * Sends a WhatsApp message using Twilio
 * @param to - The phone number to send WhatsApp to (E.164 format, e.g., +919876543210)
 * @param message - The message content
 * @returns A Promise with the message SID
 */
export const sendWhatsAppMessage = async (
  to: string,
  message: string
): Promise<string> => {
  try {
    const client = getTwilioClient();
    
    // Twilio WhatsApp sandbox number format: whatsapp:+14155238886
    // Or use your Twilio WhatsApp Business number
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;
    
    if (!fromNumber) {
      throw new Error('TWILIO_WHATSAPP_NUMBER or TWILIO_PHONE_NUMBER not configured');
    }

    // Format the 'from' number for WhatsApp (add whatsapp: prefix if not present)
    const fromWhatsApp = fromNumber.startsWith('whatsapp:') 
      ? fromNumber 
      : `whatsapp:${fromNumber}`;
    
    // Format the 'to' number for WhatsApp
    const toWhatsApp = to.startsWith('whatsapp:') 
      ? to 
      : `whatsapp:${to}`;

    console.log('📱 Sending WhatsApp message:');
    console.log('📱 From:', fromWhatsApp);
    console.log('📱 To:', toWhatsApp);
    console.log('📱 Message:', message);

    const twilioMessage = await client.messages.create({
      body: message,
      from: fromWhatsApp,
      to: toWhatsApp,
    });

    console.log('✅ WhatsApp message sent successfully!');
    console.log('📱 Message SID:', twilioMessage.sid);
    console.log('📱 Status:', twilioMessage.status);

    return twilioMessage.sid;
  } catch (error: any) {
    console.error('❌ Error sending WhatsApp message:');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
};
