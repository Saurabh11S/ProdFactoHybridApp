/**
 * Test Email and WhatsApp Sending
 * Sends test email and WhatsApp message
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const twilio = require('twilio');

console.log('\n📧 === SENDING TEST EMAIL ===\n');

const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;
const recipientEmail = 'SaurabhSharma126@gmail.com';

if (!emailUser || !emailPassword) {
  console.error('❌ Email credentials not found!');
  process.exit(1);
}

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

// Send test email
const emailOptions = {
  from: `"FACTO Consultancy" <${emailUser}>`,
  to: recipientEmail,
  subject: 'Test Email from FACTO Consultancy',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #007AFF 0%, #00C897 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Test Email from FACTO</h1>
        </div>
        <div class="content">
          <p>Hello!</p>
          <p>This is a test email from FACTO Consultancy backend system.</p>
          <p>If you received this email, it means the email configuration is working correctly!</p>
          <p>Best regards,<br>FACTO Consultancy Team</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: 'This is a test email from FACTO Consultancy backend system. If you received this email, it means the email configuration is working correctly!',
};

transporter.sendMail(emailOptions, function (error, info) {
  if (error) {
    console.error('❌ Failed to send email!\n');
    console.error('Error:', error.message);
    console.error('Error Code:', error.code);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
  } else {
    console.log('✅ Email sent successfully!');
    console.log('📧 To:', recipientEmail);
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);
    console.log('📧 Accepted:', info.accepted);
    if (info.rejected && info.rejected.length > 0) {
      console.log('⚠️  Rejected:', info.rejected);
    }
  }

  // Now send WhatsApp message
  console.log('\n📱 === SENDING WHATSAPP MESSAGE ===\n');

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;
  const recipientPhone = '8588951916';
  const message = 'Facto Welcome';

  if (!accountSid || !authToken) {
    console.error('❌ Twilio credentials not found!');
    console.error('Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
    process.exit(1);
  }

  if (!whatsappNumber) {
    console.error('❌ Twilio WhatsApp number not found!');
    console.error('Please set TWILIO_WHATSAPP_NUMBER or TWILIO_PHONE_NUMBER in .env file');
    process.exit(1);
  }

  const client = twilio(accountSid, authToken);

  // Format the 'from' number for WhatsApp (should be Twilio's WhatsApp number)
  let fromWhatsApp = whatsappNumber.startsWith('whatsapp:') 
    ? whatsappNumber 
    : `whatsapp:${whatsappNumber}`;
  
  // If the number doesn't look like a Twilio number, use the default sandbox number
  // Twilio WhatsApp sandbox number is usually: whatsapp:+14155238886
  if (!fromWhatsApp.includes('+14155238886') && !fromWhatsApp.includes('+1')) {
    console.log('⚠️  Warning: TWILIO_WHATSAPP_NUMBER does not look like a Twilio number.');
    console.log('⚠️  Using default Twilio WhatsApp Sandbox number: whatsapp:+14155238886');
    console.log('⚠️  If this fails, make sure to set TWILIO_WHATSAPP_NUMBER to your Twilio WhatsApp number');
    fromWhatsApp = 'whatsapp:+14155238886';
  }
  
  // Format the 'to' number for WhatsApp (Indian number)
  const toWhatsApp = `whatsapp:+91${recipientPhone}`;

  console.log('📱 From (Twilio WhatsApp Number):', fromWhatsApp);
  console.log('📱 To (Recipient):', toWhatsApp);
  console.log('📱 Message:', message);
  console.log('\n⏳ Sending WhatsApp message...\n');
  console.log('⚠️  Note: The recipient must have joined the Twilio WhatsApp Sandbox first!');
  console.log('⚠️  They need to send "join [code]" to the Twilio WhatsApp number.\n');

  client.messages
    .create({
      body: message,
      from: fromWhatsApp,
      to: toWhatsApp,
    })
    .then((twilioMessage) => {
      console.log('✅ WhatsApp message sent successfully!');
      console.log('📱 Message SID:', twilioMessage.sid);
      console.log('📱 Status:', twilioMessage.status);
      console.log('📱 To:', twilioMessage.to);
      console.log('📱 From:', twilioMessage.from);
      console.log('\n✅ Both email and WhatsApp messages sent successfully!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to send WhatsApp message!\n');
      console.error('Error:', error.message);
      console.error('Error Code:', error.code);
      console.error('Error Status:', error.status);
      
      if (error.code === 21211) {
        console.log('\n💡 SOLUTION:');
        console.log('   The recipient phone number needs to join the Twilio WhatsApp Sandbox first.');
        console.log('   Send "join [code]" to the Twilio WhatsApp number.');
        console.log('   Get the code from: https://console.twilio.com/us1/develop/sms/sandbox');
      } else if (error.code === 21608) {
        console.log('\n💡 SOLUTION:');
        console.log('   The recipient is not opted in to receive WhatsApp messages.');
        console.log('   They need to join the Twilio WhatsApp Sandbox first.');
      } else if (error.code === 21212) {
        console.log('\n💡 SOLUTION:');
        console.log('   Invalid WhatsApp number format.');
        console.log('   Make sure TWILIO_WHATSAPP_NUMBER is in format: whatsapp:+14155238886');
      }
      
      process.exit(1);
    });
});

