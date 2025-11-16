import nodemailer from 'nodemailer';
import { configDotenv } from 'dotenv';
import path from 'path';

configDotenv({ path: path.join(__dirname, '../../.env') });

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getEmailTransporter(): nodemailer.Transporter {
  if (!transporter) {
    // Using Gmail SMTP with increased timeout and connection settings
    // Render may have network restrictions, so we need longer timeouts
    // Try port 465 first (more reliable), fallback to 587
    const usePort465 = process.env.EMAIL_USE_PORT_465 !== 'false'; // Default to true
    
    // Clean email password - remove spaces (Gmail App Passwords don't have spaces)
    const emailPassword = (process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    
    if (!emailPassword || emailPassword.length !== 16) {
      console.warn(`⚠️ EMAIL_PASSWORD length is ${emailPassword.length} (should be 16 characters, no spaces)`);
    }
    
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: usePort465 ? 465 : 587,
      secure: usePort465, // true for 465, false for 587
      auth: {
        user: emailUser,
        pass: emailPassword, // Use cleaned password
      },
      // Increased timeouts for Render's network
      connectionTimeout: 90000, // 90 seconds (increased from 60)
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 90000, // 90 seconds (increased from 60)
      // Retry configuration
      pool: false, // Disable pooling for better connection handling
      // Additional options for better reliability
      tls: {
        rejectUnauthorized: true, // Verify SSL certificates
        minVersion: 'TLSv1.2' // Use modern TLS
      },
      debug: false, // Disable debug to reduce logs
      logger: false, // Disable logger
    });
    
    console.log(`📧 Email transporter configured: Port ${usePort465 ? 465 : 587}, Secure: ${usePort465}`);
    console.log(`📧 Email user: ${emailUser}`);
    console.log(`📧 Password length: ${emailPassword.length} characters`);
  }
  return transporter;
}

/**
 * Sends an email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email HTML content
 * @param text - Email plain text content (optional)
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string,
  retries: number = 3
): Promise<void> => {
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️ Email service not configured. EMAIL_USER and EMAIL_PASSWORD not set.');
    console.log('📧 Email would have been sent to:', to);
    console.log('📧 Subject:', subject);
    throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
  }

  console.log('📧 Attempting to send email to:', to);
  console.log('📧 From:', emailUser);
  console.log('📧 Subject:', subject);
  console.log(`🔄 Retry attempt: ${4 - retries}/3`);

  const emailTransporter = getEmailTransporter();

  const mailOptions = {
    from: `"FACTO Consultancy" <${emailUser}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text
  };

  // Retry logic for connection timeouts
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📤 Sending email (attempt ${attempt}/${retries})...`);
      console.log(`⏱️  Starting email send at: ${new Date().toISOString()}`);
      
      // Use a longer timeout for the first connection attempt
      const timeoutDuration = attempt === 1 ? 90000 : 60000; // 90s for first attempt, 60s for retries
      
      const info = await Promise.race([
        emailTransporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Email send timeout after ${timeoutDuration/1000} seconds`)), timeoutDuration)
        )
      ]) as any;

      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📧 Response:', info.response);
      console.log('📧 Accepted recipients:', info.accepted);
      if (info.rejected && info.rejected.length > 0) {
        console.warn('⚠️ Rejected recipients:', info.rejected);
      }
      return; // Success, exit function
    } catch (error: any) {
      const isTimeout = error.code === 'ETIMEDOUT' || 
                       error.message.includes('timeout') || 
                       error.command === 'CONN';
      
      console.error(`❌ Attempt ${attempt}/${retries} failed:`);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error command:', error.command);
      
      if (error.response) {
        console.error('❌ SMTP Response:', error.response);
      }

      // If it's a timeout and we have retries left, wait and retry
      if (isTimeout && attempt < retries) {
        const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        console.log(`🔄 Retrying... (${attempt + 1}/${retries})`);
        continue;
      }

      // If all retries exhausted or non-timeout error, throw
      if (attempt === retries) {
        console.error('❌ All retry attempts exhausted');
        throw new Error(`Failed to send email after ${retries} attempts: ${error.message}`);
      }
      
      // For non-timeout errors, throw immediately
      if (!isTimeout) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
    }
  }
};

/**
 * Sends consultation confirmation email to user
 */
export const sendConsultationConfirmationToUser = async (
  userEmail: string,
  userName: string,
  category: string
): Promise<void> => {
  const subject = 'Consultation Request Received - FACTO Consultancy';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #007AFF 0%, #00C897 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #007AFF; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You, ${userName}!</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>We have received your consultation request for <strong>${category}</strong>.</p>
          <p>Our expert team will review your request and get back to you within 24-48 hours.</p>
          <p>We appreciate your interest in FACTO Consultancy services.</p>
          <p>Best regards,<br>FACTO Consultancy Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(userEmail, subject, html);
};

/**
 * Sends consultation notification email to admin
 */
export const sendConsultationNotificationToAdmin = async (
  adminEmail: string,
  consultationData: {
    name: string;
    email: string;
    phoneNo: string;
    category: string;
    query: string;
  }
): Promise<void> => {
  const subject = `New Consultation Request - ${consultationData.category.toUpperCase()}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #007AFF 0%, #00C897 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #007AFF; }
        .label { font-weight: bold; color: #007AFF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Consultation Request</h1>
        </div>
        <div class="content">
          <p>You have received a new consultation request:</p>
          <div class="info-box">
            <p><span class="label">Category:</span> ${consultationData.category}</p>
            <p><span class="label">Name:</span> ${consultationData.name}</p>
            <p><span class="label">Email:</span> ${consultationData.email}</p>
            <p><span class="label">Phone:</span> ${consultationData.phoneNo}</p>
            <p><span class="label">Message:</span> ${consultationData.query}</p>
          </div>
          <p>Please review this request in the Admin Panel under the Queries section.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(adminEmail, subject, html);
};

/**
 * Sends newsletter update email to all active subscribers
 */
export const sendNewsletterUpdate = async (
  subscriberEmails: string[],
  updateType: 'blog' | 'course',
  updateData: {
    title: string;
    description?: string;
    url?: string;
    author?: string;
  }
): Promise<void> => {
  console.log('\n📧 === SEND NEWSLETTER UPDATE START ===');
  console.log(`📊 Subscribers count: ${subscriberEmails.length}`);
  console.log(`📝 Update type: ${updateType}`);
  console.log(`📄 Title: ${updateData.title}`);
  
  if (subscriberEmails.length === 0) {
    console.log('⚠️ No subscribers to notify');
    return;
  }

  // Check email configuration
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  
  if (!emailUser || !emailPassword) {
    console.error('❌ Email service not configured!');
    console.error('❌ EMAIL_USER:', !!emailUser);
    console.error('❌ EMAIL_PASSWORD:', !!emailPassword);
    throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in environment variables');
  }

  console.log('✅ Email service configured');
  console.log('📧 From email:', emailUser);

  const updateTypeLabel = updateType === 'blog' ? 'New Blog Post' : 'New Course';
  const subject = `${updateTypeLabel}: ${updateData.title}`;
  
  console.log('📧 Email subject:', subject);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #007AFF 0%, #00C897 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #007AFF; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .update-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #007AFF; border-radius: 5px; }
        .title { font-size: 24px; font-weight: bold; color: #007AFF; margin-bottom: 10px; }
        .description { color: #666; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 New Update from FACTO</h1>
        </div>
        <div class="content">
          <p>Dear Subscriber,</p>
          <p>We're excited to share a new ${updateType === 'blog' ? 'blog post' : 'course'} with you!</p>
          
          <div class="update-box">
            <div class="title">${updateData.title}</div>
            ${updateData.description ? `<div class="description">${updateData.description}</div>` : ''}
            ${updateData.author ? `<p><strong>Author:</strong> ${updateData.author}</p>` : ''}
          </div>
          
          ${updateData.url ? `
            <div style="text-align: center;">
              <a href="${updateData.url}" class="button">Read More →</a>
            </div>
          ` : ''}
          
          <p>Stay updated with the latest finance tips, tax strategies, and investment insights from FACTO Consultancy.</p>
          
          <div class="footer">
            <p>You're receiving this email because you subscribed to our newsletter.</p>
            <p>If you no longer wish to receive these updates, you can <a href="${process.env.FRONTEND_URL || 'https://facto.org.in'}/unsubscribe?email={{EMAIL}}">unsubscribe here</a>.</p>
            <p>&copy; ${new Date().getFullYear()} FACTO Consultancy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send emails to all subscribers
  console.log(`\n📤 Starting to send emails to ${subscriberEmails.length} subscribers...`);
  
  const emailPromises = subscriberEmails.map(async (email, index) => {
    try {
      console.log(`\n📧 [${index + 1}/${subscriberEmails.length}] Sending to: ${email}`);
      // Replace {{EMAIL}} placeholder with actual email for unsubscribe link
      const personalizedHtml = html.replace(/\{\{EMAIL\}\}/g, encodeURIComponent(email));
      await sendEmail(email, subject, personalizedHtml);
      console.log(`✅ [${index + 1}/${subscriberEmails.length}] Newsletter email sent successfully to: ${email}`);
      return { email, success: true };
    } catch (error: any) {
      console.error(`❌ [${index + 1}/${subscriberEmails.length}] Failed to send newsletter email to ${email}:`, error.message);
      console.error(`❌ Error details:`, error);
      // Continue sending to other subscribers even if one fails
      return { email, success: false, error: error.message };
    }
  });

  const results = await Promise.allSettled(emailPromises);
  
  // Count successes and failures
  let successCount = 0;
  let failureCount = 0;
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failureCount++;
    }
  });
  
  console.log(`\n📊 === NEWSLETTER UPDATE SUMMARY ===`);
  console.log(`✅ Successfully sent: ${successCount}/${subscriberEmails.length}`);
  console.log(`❌ Failed: ${failureCount}/${subscriberEmails.length}`);
  console.log(`📧 Newsletter update process completed`);
};

/**
 * Sends newsletter update email to a single subscriber
 */
export const sendNewsletterUpdateToSubscriber = async (
  subscriberEmail: string,
  updateType: 'blog' | 'course',
  updateData: {
    title: string;
    description?: string;
    url?: string;
    author?: string;
  }
): Promise<void> => {
  await sendNewsletterUpdate([subscriberEmail], updateType, updateData);
};

