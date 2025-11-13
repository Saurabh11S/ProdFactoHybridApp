/**
 * Check WhatsApp Configuration
 */

require('dotenv').config();

console.log('\n📱 === WHATSAPP CONFIGURATION CHECK ===\n');

const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;

console.log('Current TWILIO_WHATSAPP_NUMBER:', whatsappNumber || 'Not set');
console.log('Current TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'Not set');

if (whatsappNumber) {
  if (whatsappNumber.includes('8588951916')) {
    console.log('\n❌ ERROR: TWILIO_WHATSAPP_NUMBER is set to recipient number!');
    console.log('   This should be your Twilio WhatsApp number, not the recipient number.');
  } else if (whatsappNumber.includes('+14155238886') || whatsappNumber.includes('14155238886')) {
    console.log('\n✅ TWILIO_WHATSAPP_NUMBER looks correct (Twilio Sandbox number)');
  } else if (whatsappNumber.startsWith('whatsapp:')) {
    console.log('\n⚠️  TWILIO_WHATSAPP_NUMBER format looks correct but verify it\'s your Twilio number');
  } else {
    console.log('\n⚠️  TWILIO_WHATSAPP_NUMBER format may be incorrect');
    console.log('   Should be: whatsapp:+14155238886 (for sandbox)');
  }
} else {
  console.log('\n❌ TWILIO_WHATSAPP_NUMBER is not set!');
}

console.log('\n📋 === HOW TO GET YOUR TWILIO WHATSAPP NUMBER ===\n');
console.log('1. Go to: https://console.twilio.com/us1/develop/sms/sandbox');
console.log('2. You will see a WhatsApp number like: +1 415 523 8886');
console.log('3. Copy that number and set it in .env as:');
console.log('   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886');
console.log('   (Replace +14155238886 with your actual Twilio WhatsApp number)');
console.log('\n4. The recipient (8588951916) needs to join the sandbox by:');
console.log('   - Sending "join [code]" to the Twilio WhatsApp number');
console.log('   - The code is shown on the Twilio Sandbox page');
console.log('\n');

