# Email Notification Troubleshooting Guide

## Problem: Emails work from localhost but not from Vercel Admin App

### Root Cause
When creating a blog from the Vercel Admin App, the request goes to the Render backend. The email notification runs asynchronously and may fail silently if:
1. Email environment variables are not set in Render
2. Email service configuration is missing
3. Errors are caught but not visible

## Solution: Check Render Environment Variables

### Step 1: Verify Email Configuration in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **Backend Service** (facto-backend-api)
3. Go to **Environment** tab
4. Verify these variables are set:

#### Required Variables:
- **EMAIL_USER** or **GMAIL_USER**
  - Value: Your Gmail address (e.g., `your-email@gmail.com`)
  
- **EMAIL_PASSWORD** or **GMAIL_APP_PASSWORD**
  - Value: Gmail App Password (16 characters)
  - **NOT your regular Gmail password!**
  - Generate at: https://myaccount.google.com/apppasswords

#### Optional but Recommended:
- **FRONTEND_URL**
  - Value: `https://facto.org.in`
  - Used for links in emails

### Step 2: Generate Gmail App Password

If you don't have a Gmail App Password:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **Mail** and **Other (Custom name)**
5. Enter name: "FACTO Backend"
6. Click **Generate**
7. Copy the 16-character password (no spaces)
8. Add to Render as `EMAIL_PASSWORD`

### Step 3: Verify Configuration

After setting environment variables:

1. **Redeploy** your Render service
2. Create a test blog from Vercel Admin App
3. Check **Render Logs** for email notification logs:
   - Look for: `📧 === BLOG NEWSLETTER NOTIFICATION START ===`
   - Should see: `✅ Email service configured`
   - Should see: `📊 Found X active subscribers`
   - Should see: `✅ Newsletter email sent successfully to: email@example.com`

### Step 4: Check for Errors

If emails still don't send, check Render logs for:

#### Error: Email service not configured
```
❌ EMAIL_USER: ✗
❌ EMAIL_PASSWORD: ✗
```
**Fix**: Set EMAIL_USER and EMAIL_PASSWORD in Render

#### Error: Authentication failed
```
❌ Error code: EAUTH
❌ SMTP Response: 535-5.7.8 Username and Password not accepted
```
**Fix**: 
- Verify Gmail App Password is correct (16 characters, no spaces)
- Ensure 2-Step Verification is enabled
- Regenerate App Password if needed

#### Error: No active subscribers
```
⚠️ No active subscribers found to notify
```
**Fix**: This is normal if no one has subscribed. Check database for NewsletterSubscription records with `isActive: true`

#### Error: Timeout or network error
```
❌ Error code: ETIMEDOUT
❌ Error message: Connection timeout
```
**Fix**: 
- Check Render service is running
- Check network connectivity
- Verify SMTP settings

## Testing Email Configuration

### Test from Render Logs

1. Create a blog from Vercel Admin App
2. Immediately check Render logs
3. Look for the email notification section
4. Verify each step completes successfully

### Expected Log Output (Success)

```
📧 === BLOG NEWSLETTER NOTIFICATION START ===
📅 Timestamp: 2025-11-16T12:00:00.000Z
🌍 Environment: production
✅ Email service configured
📧 From email: your-email@gmail.com
📊 Found 2 active subscribers
📧 Preparing to send newsletter to 2 subscribers
📧 Subscriber emails: [ 'subscriber1@example.com', 'subscriber2@example.com' ]
🔗 Blog URL: https://facto.org.in/blogs/1234567890
📝 Blog Title: Your Blog Title

📧 === SEND NEWSLETTER UPDATE START ===
📊 Subscribers count: 2
📝 Update type: blog
📄 Title: Your Blog Title
✅ Email service configured
📧 From email: your-email@gmail.com
📧 Email subject: New Blog Post: Your Blog Title

📤 Starting to send emails to 2 subscribers...

📧 [1/2] Sending to: subscriber1@example.com
📧 Attempting to send email to: subscriber1@example.com
📧 From: your-email@gmail.com
📧 Subject: New Blog Post: Your Blog Title
✅ Email sent successfully!
✅ [1/2] Newsletter email sent successfully to: subscriber1@example.com

📧 [2/2] Sending to: subscriber2@example.com
📧 Attempting to send email to: subscriber2@example.com
📧 From: your-email@gmail.com
📧 Subject: New Blog Post: Your Blog Title
✅ Email sent successfully!
✅ [2/2] Newsletter email sent successfully to: subscriber2@example.com

📊 === NEWSLETTER UPDATE SUMMARY ===
✅ Successfully sent: 2/2
❌ Failed: 0/2
📧 Newsletter update process completed
✅ Newsletter notification process completed
```

## Quick Checklist

- [ ] EMAIL_USER or GMAIL_USER is set in Render
- [ ] EMAIL_PASSWORD or GMAIL_APP_PASSWORD is set in Render
- [ ] Gmail App Password is 16 characters (no spaces)
- [ ] 2-Step Verification is enabled on Gmail account
- [ ] FRONTEND_URL is set to `https://facto.org.in` (optional but recommended)
- [ ] Render service has been redeployed after setting variables
- [ ] Checked Render logs for email notification process
- [ ] Verified active subscribers exist in database

## Still Not Working?

1. **Check Render Logs**: Look for detailed error messages
2. **Verify Gmail Settings**: Ensure App Password is correct
3. **Test Email Service**: Try sending a test email manually
4. **Check Database**: Verify NewsletterSubscription records exist with `isActive: true`
5. **Contact Support**: If issue persists, share Render logs for debugging

## Common Mistakes

❌ **Using regular Gmail password instead of App Password**
- Regular passwords won't work with SMTP
- Must use App Password (16 characters)

❌ **Not redeploying after setting environment variables**
- Environment variables only take effect after redeploy

❌ **Setting variables in wrong service**
- Make sure you're setting them in the **Backend Service**, not frontend

❌ **Typos in environment variable names**
- Must be exactly: `EMAIL_USER` or `GMAIL_USER`
- Must be exactly: `EMAIL_PASSWORD` or `GMAIL_APP_PASSWORD`

