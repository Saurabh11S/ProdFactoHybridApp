# Fix Email Connection Timeout on Render

## Problem
Getting `ETIMEDOUT` error when sending emails from Render backend:
```
❌ Error code: ETIMEDOUT
❌ Error command: CONN
❌ Error message: Connection timeout
```

## Root Cause
Render's network may have restrictions or Gmail SMTP may be blocking connections from Render's IP addresses. This is common on free tier services.

## Solutions

### Solution 1: Use Port 465 with SSL (Recommended)

Gmail SMTP on port 465 with SSL is more reliable than port 587 with STARTTLS.

**Update emailService.ts** to use port 465:

```typescript
transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
});
```

### Solution 2: Use Alternative Email Service (Best for Production)

Consider using a dedicated email service that's more reliable on cloud platforms:

#### Option A: SendGrid (Recommended)
1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create API key
3. Update emailService.ts:

```typescript
transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

#### Option B: Mailgun
1. Sign up at https://mailgun.com (free tier: 5,000 emails/month)
2. Get SMTP credentials
3. Update emailService.ts with Mailgun SMTP settings

#### Option C: AWS SES
1. Set up AWS SES
2. Get SMTP credentials
3. Update emailService.ts with AWS SES settings

### Solution 3: Use OAuth2 Instead of App Password

Gmail OAuth2 is more reliable but requires more setup:

1. Create OAuth2 credentials in Google Cloud Console
2. Implement OAuth2 flow
3. Use OAuth2 tokens instead of App Password

### Solution 4: Upgrade Render Plan

Free tier may have network restrictions. Consider upgrading to a paid plan for better network connectivity.

## Current Fix Applied

The code has been updated with:
- ✅ Increased timeouts (60 seconds)
- ✅ Retry logic (3 attempts with exponential backoff)
- ✅ Better error handling
- ✅ Modern TLS configuration

## Testing

After applying fixes:

1. **Redeploy** your Render service
2. Create a test blog
3. Check Render logs for:
   - `📤 Sending email (attempt 1/3)...`
   - `✅ Email sent successfully!` (on success)
   - Retry attempts if timeout occurs

## Quick Fix: Try Port 465

The easiest fix is to change from port 587 to port 465:

1. Update `emailService.ts` line 17: `port: 465`
2. Update line 18: `secure: true`
3. Redeploy

Port 465 uses SSL directly and is often more reliable than STARTTLS on port 587.

## If Still Not Working

1. **Check Render Logs**: Look for specific error messages
2. **Test SMTP Connection**: Try connecting to Gmail SMTP from Render
3. **Consider Alternative Service**: SendGrid or Mailgun are more reliable
4. **Check Gmail Settings**: Ensure App Password is correct and 2FA is enabled
5. **Contact Render Support**: They may have network restrictions

## Recommended: Use SendGrid

For production, I recommend using SendGrid:
- ✅ More reliable on cloud platforms
- ✅ Better deliverability
- ✅ Free tier: 100 emails/day
- ✅ Easy to set up
- ✅ Better analytics

Would you like me to implement SendGrid integration?

