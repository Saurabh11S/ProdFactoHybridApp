import twilio from "twilio";
import { configDotenv } from "dotenv";
import path from "path";
configDotenv({ path: path.join(__dirname, '../../.env') })

console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set');
console.log('TWILIO_SERVICE_SID:', process.env.TWILIO_SERVICE_SID ? 'Set' : 'Not set');

// Lazy initialization - only create Twilio client when needed
let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
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
