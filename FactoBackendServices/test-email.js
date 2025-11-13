/**
 * Test Email Sending
 * This script tests if email configuration is working correctly
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n📧 === EMAIL CONFIGURATION TEST ===\n');

const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;

if (!emailUser || !emailPassword) {
  console.error('❌ Email credentials not found!');
  console.log('\nPlease set in .env file:');
  console.log('  EMAIL_USER=your-gmail@gmail.com');
  console.log('  EMAIL_PASSWORD=your-app-password\n');
  process.exit(1);
}

console.log('📧 Email User:', emailUser);
console.log('📧 Password Length:', emailPassword.length, 'characters');
console.log('📧 Password Format:', emailPassword.length === 16 ? '✅ Correct (16 chars)' : '⚠️  Should be 16 characters for Gmail App Password');

console.log('\n🔧 Creating email transporter...\n');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

// Test connection
console.log('🔍 Testing email connection...\n');

transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email connection failed!\n');
    console.error('Error:', error.message);
    console.error('Error Code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 SOLUTION:');
      console.log('   1. Make sure you\'re using Gmail App Password, not regular password');
      console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('   3. Enable 2-Step Verification first: https://myaccount.google.com/security');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 SOLUTION:');
      console.log('   Check your internet connection and firewall settings');
    }
    
    process.exit(1);
  } else {
    console.log('✅ Email server connection successful!\n');
    
    // Test sending email
    console.log('📤 Testing email send...\n');
    
    const testEmail = {
      from: `"FACTO Consultancy" <${emailUser}>`,
      to: emailUser, // Send to self for testing
      subject: 'Test Email - FACTO Consultancy',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from FACTO Consultancy backend.</p>
        <p>If you received this, your email configuration is working correctly!</p>
      `,
      text: 'This is a test email from FACTO Consultancy backend.',
    };
    
    transporter.sendMail(testEmail, function (error, info) {
      if (error) {
        console.error('❌ Failed to send test email!\n');
        console.error('Error:', error.message);
        console.error('Error Code:', error.code);
        console.error('Command:', error.command);
        
        if (error.response) {
          console.error('SMTP Response:', error.response);
        }
        
        process.exit(1);
      } else {
        console.log('✅ Test email sent successfully!\n');
        console.log('📧 Message ID:', info.messageId);
        console.log('📧 Response:', info.response);
        console.log('📧 Accepted:', info.accepted);
        
        if (info.rejected && info.rejected.length > 0) {
          console.log('⚠️  Rejected:', info.rejected);
        }
        
        console.log('\n✅ Email configuration is working correctly!');
        console.log('📧 Check your inbox (and spam folder) for the test email.\n');
        process.exit(0);
      }
    });
  }
});

