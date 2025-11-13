/**
 * Environment Variables Verification Script
 * Run this to check which environment variables are set correctly
 */

require('dotenv').config();
const path = require('path');

console.log('\n🔍 === ENVIRONMENT VARIABLES VERIFICATION ===\n');

const requiredVars = {
  // Email Configuration
  'EMAIL_USER': {
    required: true,
    description: 'Gmail address for sending emails',
    alternatives: ['GMAIL_USER'],
    check: () => process.env.EMAIL_USER || process.env.GMAIL_USER
  },
  'EMAIL_PASSWORD': {
    required: true,
    description: 'Gmail App Password (16 characters)',
    alternatives: ['GMAIL_APP_PASSWORD'],
    check: () => process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD
  },
  
  // Twilio Configuration (for SMS and WhatsApp)
  'TWILIO_ACCOUNT_SID': {
    required: true,
    description: 'Twilio Account SID',
    check: () => process.env.TWILIO_ACCOUNT_SID
  },
  'TWILIO_AUTH_TOKEN': {
    required: true,
    description: 'Twilio Auth Token',
    check: () => process.env.TWILIO_AUTH_TOKEN
  },
  'TWILIO_SERVICE_SID': {
    required: true,
    description: 'Twilio Service SID (for OTP)',
    check: () => process.env.TWILIO_SERVICE_SID
  },
  'TWILIO_PHONE_NUMBER': {
    required: false,
    description: 'Twilio Phone Number (for SMS)',
    check: () => process.env.TWILIO_PHONE_NUMBER
  },
  'TWILIO_WHATSAPP_NUMBER': {
    required: false,
    description: 'Twilio WhatsApp Number (format: whatsapp:+14155238886)',
    alternatives: ['TWILIO_PHONE_NUMBER'],
    check: () => process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER
  },
  
  // Admin Configuration (optional)
  'ADMIN_PHONE_NUMBER': {
    required: false,
    description: 'Admin phone number for notifications',
    check: () => process.env.ADMIN_PHONE_NUMBER
  },
  
  // Database & Server
  'MONGODB_URI': {
    required: true,
    description: 'MongoDB connection string',
    check: () => process.env.MONGODB_URI
  },
  'JWT_SECRET': {
    required: true,
    description: 'JWT secret key',
    check: () => process.env.JWT_SECRET
  },
  'PORT': {
    required: false,
    description: 'Server port (default: 8080)',
    check: () => process.env.PORT || '8080'
  },
  'NODE_ENV': {
    required: false,
    description: 'Node environment (development/production)',
    check: () => process.env.NODE_ENV || 'development'
  }
};

let allPassed = true;
const results = {
  passed: [],
  failed: [],
  missing: [],
  warnings: []
};

// Check each variable
Object.entries(requiredVars).forEach(([varName, config]) => {
  const value = config.check();
  const isSet = value !== undefined && value !== null && value !== '';
  
  if (config.required) {
    if (isSet) {
      // Mask sensitive values
      const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') || varName.includes('TOKEN') || varName.includes('SID')
        ? '*'.repeat(Math.min(value.length, 20)) + (value.length > 20 ? '...' : '')
        : value;
      
      results.passed.push({
        name: varName,
        value: displayValue,
        description: config.description
      });
      console.log(`✅ ${varName.padEnd(30)} ${'✓'.padEnd(5)} ${config.description}`);
    } else {
      allPassed = false;
      const alternatives = config.alternatives ? ` (or ${config.alternatives.join(', ')})` : '';
      results.failed.push({
        name: varName,
        description: config.description,
        alternatives: config.alternatives || []
      });
      console.log(`❌ ${varName.padEnd(30)} ${'✗'.padEnd(5)} MISSING - ${config.description}${alternatives}`);
    }
  } else {
    // Optional variables
    if (isSet) {
      const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') || varName.includes('TOKEN')
        ? '*'.repeat(Math.min(value.length, 20)) + (value.length > 20 ? '...' : '')
        : value;
      
      results.passed.push({
        name: varName,
        value: displayValue,
        description: config.description
      });
      console.log(`✅ ${varName.padEnd(30)} ${'✓'.padEnd(5)} ${config.description} (optional)`);
    } else {
      results.warnings.push({
        name: varName,
        description: config.description,
        alternatives: config.alternatives || []
      });
      const alternatives = config.alternatives ? ` (or ${config.alternatives.join(', ')})` : '';
      console.log(`⚠️  ${varName.padEnd(30)} ${'⚠'.padEnd(5)} NOT SET - ${config.description}${alternatives} (optional)`);
    }
  }
});

// Additional validations
console.log('\n🔍 === ADDITIONAL VALIDATIONS ===\n');

// Check email format
const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
if (emailUser) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailUser)) {
    console.log(`⚠️  EMAIL_USER format may be invalid: ${emailUser}`);
    results.warnings.push({ name: 'EMAIL_USER', issue: 'Format may be invalid' });
  }
}

// Check WhatsApp number format
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;
if (whatsappNumber && !whatsappNumber.startsWith('whatsapp:') && !whatsappNumber.startsWith('+')) {
  console.log(`⚠️  TWILIO_WHATSAPP_NUMBER should start with 'whatsapp:' or '+'`);
  results.warnings.push({ name: 'TWILIO_WHATSAPP_NUMBER', issue: 'Format may be incorrect' });
}

// Check App Password length (should be 16 characters for Gmail)
const emailPassword = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;
if (emailPassword && emailPassword.length !== 16 && !emailPassword.includes(' ')) {
  console.log(`⚠️  EMAIL_PASSWORD length is ${emailPassword.length} (Gmail App Password should be 16 characters)`);
  results.warnings.push({ name: 'EMAIL_PASSWORD', issue: 'Length may be incorrect' });
}

// Summary
console.log('\n📊 === SUMMARY ===\n');
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed (Required): ${results.failed.length}`);
console.log(`⚠️  Warnings (Optional): ${results.warnings.length}`);

if (results.failed.length > 0) {
  console.log('\n❌ REQUIRED VARIABLES MISSING:\n');
  results.failed.forEach(item => {
    console.log(`   - ${item.name}: ${item.description}`);
    if (item.alternatives.length > 0) {
      console.log(`     Alternatives: ${item.alternatives.join(', ')}`);
    }
  });
}

if (results.warnings.length > 0 && results.warnings.some(w => w.issue)) {
  console.log('\n⚠️  VALIDATION WARNINGS:\n');
  results.warnings.filter(w => w.issue).forEach(item => {
    console.log(`   - ${item.name}: ${item.issue}`);
  });
}

console.log('\n📝 === RECOMMENDATIONS ===\n');

if (results.failed.length > 0) {
  console.log('🔴 CRITICAL: Set the following required variables in your .env file:\n');
  results.failed.forEach(item => {
    console.log(`   ${item.name}=your_value_here`);
  });
  console.log('');
}

// Email setup instructions
if (!emailUser || !emailPassword) {
  console.log('📧 EMAIL SETUP:\n');
  console.log('   1. Enable 2-Step Verification: https://myaccount.google.com/security');
  console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
  console.log('   3. Add to .env:');
  console.log('      EMAIL_USER=your-gmail@gmail.com');
  console.log('      EMAIL_PASSWORD=your-16-char-app-password');
  console.log('');
}

// WhatsApp setup instructions
if (!whatsappNumber) {
  console.log('📱 WHATSAPP SETUP:\n');
  console.log('   1. Sign up for Twilio: https://www.twilio.com/try-twilio');
  console.log('   2. Join WhatsApp Sandbox: https://console.twilio.com/us1/develop/sms/sandbox');
  console.log('   3. Add to .env:');
  console.log('      TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886');
  console.log('');
}

if (allPassed) {
  console.log('✅ All required environment variables are set!\n');
} else {
  console.log('❌ Some required environment variables are missing. Please set them before running the application.\n');
}

process.exit(allPassed ? 0 : 1);

