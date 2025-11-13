# Consultation Feature Setup Guide

## 📧 Email Configuration

### For Gmail (Recommended)

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "FACTO Backend" as the name
   - Copy the generated 16-character password

3. **Add to `.env` file:**
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   
   # OR use these alternative variable names
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

### For Other Email Providers

Update the SMTP configuration in `FactoBackendServices/src/utils/emailService.ts`:

```typescript
transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## 📱 WhatsApp Configuration (Twilio)

### Step 1: Get Twilio WhatsApp Number

1. **Sign up for Twilio:** https://www.twilio.com/try-twilio
2. **Go to WhatsApp Sandbox:** https://console.twilio.com/us1/develop/sms/sandbox
3. **Join the Sandbox** by sending the join code to the Twilio WhatsApp number
4. **Get your WhatsApp number** (format: `whatsapp:+14155238886`)

### Step 2: For Production (Optional)

To use a production WhatsApp Business number:
1. Apply for WhatsApp Business API via Twilio
2. Get your approved WhatsApp Business number
3. Use that number instead of the sandbox number

### Step 3: Add to `.env` file:

```env
# Twilio Configuration (already set for SMS/OTP)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_SERVICE_SID=your_service_sid

# WhatsApp Configuration
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Sandbox number
# OR use your regular Twilio number (will use whatsapp: prefix automatically)
TWILIO_PHONE_NUMBER=+1234567890

# Admin notifications (optional)
ADMIN_PHONE_NUMBER=+919876543210  # Admin phone for SMS/WhatsApp notifications
```

## 🔍 Troubleshooting

### Email Not Being Received

1. **Check server logs** - Look for email sending logs:
   ```
   📧 Attempting to send email to: user@example.com
   ✅ Email sent successfully!
   ```

2. **Verify environment variables:**
   ```bash
   # In your backend directory
   echo $EMAIL_USER
   echo $EMAIL_PASSWORD
   ```

3. **Common issues:**
   - **"Less secure app access"** - Use App Password instead
   - **Wrong password** - Make sure you're using App Password, not regular password
   - **Email in spam** - Check spam folder
   - **Invalid email** - Verify the recipient email address

4. **Test email sending:**
   - Check backend console logs when submitting consultation
   - Look for error messages with details

### WhatsApp Not Working

1. **Check Twilio WhatsApp Sandbox:**
   - Make sure you've joined the sandbox
   - Send "join [code]" to the Twilio WhatsApp number
   - Verify your number is registered

2. **Check environment variables:**
   ```bash
   echo $TWILIO_WHATSAPP_NUMBER
   echo $TWILIO_ACCOUNT_SID
   ```

3. **Common issues:**
   - **Number not in sandbox** - Join the Twilio WhatsApp sandbox first
   - **Wrong number format** - Should be `whatsapp:+14155238886` or `+14155238886`
   - **Twilio not configured** - Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN

4. **Test WhatsApp:**
   - Check backend console logs for WhatsApp sending attempts
   - Look for error messages with error codes

## 📋 Complete Environment Variables

Add these to `FactoBackendServices/.env`:

```env
# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password

# Twilio Configuration (for SMS and WhatsApp)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_SERVICE_SID=your_service_sid
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Admin Notifications (optional)
ADMIN_PHONE_NUMBER=+919876543210
```

## ✅ Testing

1. **Test Email:**
   - Submit a consultation request with an email
   - Check server logs for email sending status
   - Check recipient's inbox (and spam folder)

2. **Test WhatsApp:**
   - Submit a consultation request with a phone number
   - Make sure the phone number has joined Twilio WhatsApp sandbox
   - Check server logs for WhatsApp sending status
   - Check recipient's WhatsApp

3. **Test Admin Notifications:**
   - Submit a consultation request
   - Admin should receive email at `facto.m.consultancy@gmail.com`
   - Admin should receive WhatsApp if `ADMIN_PHONE_NUMBER` is set

## 🚀 Production Deployment

For production (Render.com), add all environment variables in the Render dashboard:
1. Go to your Render service
2. Navigate to "Environment" tab
3. Add all the variables listed above

Make sure to:
- Use production email credentials
- Use production Twilio WhatsApp Business number (not sandbox)
- Set proper admin phone number

