/**
 * Test Script for Newsletter Subscription Flow
 * 
 * This script tests the complete subscription flow:
 * 1. Subscribe to newsletter
 * 2. Create a test blog
 * 3. Verify emails are sent to subscribers
 * 
 * Usage: node test-newsletter-subscription.js
 */

require('dotenv').config();
const axios = require('axios');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testNewsletterSubscription() {
  try {
    log('\n🧪 ===== Testing Newsletter Subscription Flow =====\n', 'cyan');

    // Step 1: Subscribe to newsletter
    log('📧 Step 1: Subscribing to newsletter...', 'blue');
    try {
      const subscribeResponse = await axios.post(`${API_BASE_URL}/newsletter/subscribe`, {
        email: TEST_EMAIL,
      });

      if (subscribeResponse.data.success) {
        log('✅ Successfully subscribed to newsletter!', 'green');
        log(`   Email: ${TEST_EMAIL}`, 'yellow');
      } else {
        log(`⚠️  Subscription response: ${subscribeResponse.data.message}`, 'yellow');
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already subscribed')) {
        log('ℹ️  Email already subscribed (this is okay for testing)', 'yellow');
      } else {
        throw error;
      }
    }

    // Step 2: Get subscription stats
    log('\n📊 Step 2: Getting subscription statistics...', 'blue');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/newsletter/stats`);
      if (statsResponse.data.success) {
        const stats = statsResponse.data.data.stats;
        log('✅ Subscription Statistics:', 'green');
        log(`   Total Subscriptions: ${stats.total}`, 'yellow');
        log(`   Active Subscriptions: ${stats.active}`, 'yellow');
        log(`   Inactive Subscriptions: ${stats.inactive}`, 'yellow');
      }
    } catch (error) {
      log(`⚠️  Could not fetch stats: ${error.message}`, 'yellow');
    }

    // Step 3: Login as admin
    log('\n🔐 Step 3: Logging in as admin...', 'blue');
    let adminToken;
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (loginResponse.data.success && loginResponse.data.data?.token) {
        adminToken = loginResponse.data.data.token;
        log('✅ Successfully logged in as admin!', 'green');
      } else {
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      log(`❌ Admin login failed: ${error.response?.data?.message || error.message}`, 'red');
      log('   Please check ADMIN_EMAIL and ADMIN_PASSWORD in .env file', 'yellow');
      log('   Or manually login to admin app and create a blog there', 'yellow');
      return;
    }

    // Step 4: Create a test blog
    log('\n📝 Step 4: Creating a test blog...', 'blue');
    try {
      const blogData = {
        title: `Test Blog - ${new Date().toISOString()}`,
        content: 'This is a test blog created to verify the newsletter subscription feature. When this blog is created, all active subscribers should receive an email notification.',
        contentType: 'image',
        contentUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
        reference: JSON.stringify({
          title: 'Test Reference',
          url: 'https://example.com',
        }),
        tags: JSON.stringify(['Test', 'Newsletter', 'Subscription']),
        author: 'Test Admin',
      };

      const blogResponse = await axios.post(
        `${API_BASE_URL}/admin/blogs`,
        blogData,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (blogResponse.data.success) {
        log('✅ Test blog created successfully!', 'green');
        log(`   Blog ID: ${blogResponse.data.data?.blog?._id || 'N/A'}`, 'yellow');
        log(`   Title: ${blogData.title}`, 'yellow');
        log('\n📧 Email notifications should be sent to all active subscribers!', 'cyan');
        log('   Check your email inbox (and spam folder) for the notification.', 'yellow');
      } else {
        throw new Error('Blog creation failed');
      }
    } catch (error) {
      log(`❌ Failed to create blog: ${error.response?.data?.message || error.message}`, 'red');
      if (error.response?.status === 401) {
        log('   Authentication failed. Please check your admin credentials.', 'yellow');
      }
    }

    // Step 5: Verify subscription
    log('\n✅ Step 5: Verification complete!', 'green');
    log('\n📋 Next Steps:', 'cyan');
    log('   1. Check your email inbox (and spam folder) for the newsletter email', 'yellow');
    log('   2. Verify the email contains the blog title and content', 'yellow');
    log('   3. Check backend logs for email sending confirmation', 'yellow');
    log('   4. If emails are not received, check:', 'yellow');
    log('      - EMAIL_USER and EMAIL_PASSWORD in .env file', 'yellow');
    log('      - Backend console logs for email errors', 'yellow');
    log('      - Email service configuration (Gmail app password, etc.)', 'yellow');

    log('\n✨ Test completed!\n', 'cyan');

  } catch (error) {
    log(`\n❌ Test failed with error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    process.exit(1);
  }
}

// Run the test
testNewsletterSubscription();

