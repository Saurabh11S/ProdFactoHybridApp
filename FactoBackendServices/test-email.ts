/**
 * Test script for SendGrid email notifications
 * Run: npx ts-node -r tsconfig-paths/register test-email.ts
 */

import { configDotenv } from 'dotenv';
import path from 'path';
import { sendEmail } from './src/utils/emailService';

// Load environment variables
configDotenv({ path: path.join(__dirname, '.env') });

// Also try to load sendgrid.env if it exists
try {
  const sendgridEnv = path.join(__dirname, 'sendgrid.env');
  const fs = require('fs');
  if (fs.existsSync(sendgridEnv)) {
    const sendgridContent = fs.readFileSync(sendgridEnv, 'utf8');
    sendgridContent.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^['"]|['"]$/g, '');
          process.env[key.trim()] = value.trim();
        }
      }
    });
    console.log('✅ Loaded sendgrid.env file');
  }
} catch (error) {
  console.log('ℹ️  sendgrid.env not found or couldn\'t be loaded');
}

async function testEmail() {
  console.log('\n📧 === TESTING SENDGRID EMAIL NOTIFICATION ===\n');
  
  // Check configuration
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@facto.org.in';
  const emailService = process.env.EMAIL_SERVICE || (sendGridApiKey ? 'sendgrid' : 'gmail');
  
  console.log('Configuration:');
  console.log('  EMAIL_SERVICE:', emailService);
  console.log('  SENDGRID_API_KEY:', sendGridApiKey ? '✅ Set (' + sendGridApiKey.substring(0, 10) + '...)' : '❌ Not set');
  console.log('  SENDGRID_FROM_EMAIL:', fromEmail);
  console.log('');
  
  if (!sendGridApiKey && emailService === 'sendgrid') {
    console.error('❌ ERROR: SENDGRID_API_KEY is not set!');
    console.error('   Please set it in your .env file or sendgrid.env file');
    process.exit(1);
  }
  
  // Get test email from command line or use default
  const testEmail = process.argv[2] || process.env.TEST_EMAIL || 'test@example.com';
  
  console.log('📤 Sending test email to:', testEmail);
  console.log('📧 From:', fromEmail);
  console.log('');
  
  try {
    const subject = 'Test Email from FACTO Consultancy - SendGrid';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #007AFF 0%, #00C897 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { color: #00C897; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Test Successful!</h1>
          </div>
          <div class="content">
            <p>Dear User,</p>
            <p>This is a <span class="success">test email</span> from FACTO Consultancy to verify that SendGrid email notifications are working correctly.</p>
            <p><strong>Email Service:</strong> ${emailService.toUpperCase()}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p>If you received this email, it means your SendGrid configuration is working properly! 🎉</p>
            <p>Best regards,<br>FACTO Consultancy Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail(testEmail, subject, html);
    
    console.log('✅ SUCCESS: Test email sent successfully!');
    console.log('📧 Check your inbox at:', testEmail);
    console.log('');
    
  } catch (error: any) {
    console.error('❌ ERROR: Failed to send test email');
    console.error('Error details:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  1. Check if SENDGRID_API_KEY is correct');
    console.error('  2. Verify the sender email is verified in SendGrid');
    console.error('  3. Check SendGrid Activity Feed for delivery status');
    console.error('  4. Ensure your SendGrid account is not suspended');
    process.exit(1);
  }
}

// Run the test
testEmail()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

