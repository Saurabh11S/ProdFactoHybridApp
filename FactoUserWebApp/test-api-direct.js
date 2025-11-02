// Direct API test to identify the exact 500 error issue
const axios = require('axios');

const API_BASE_URL = 'https://api.facto.org.in/api/v1';

async function testAdminLogin() {
  console.log('🔧 Testing Admin Login API Directly...\n');
  
  try {
    // First, let's create an admin user
    console.log('1️⃣ Creating admin user...');
    const adminData = {
      email: 'admin@facto.org.in',
      password: 'admin123',
      fullName: 'Admin User',
      phoneNumber: '9876543210',
      aadharNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      dateOfBirth: '1990-01-01'
    };
    
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/admin/create`, adminData);
      console.log('✅ Admin user created successfully');
      console.log('Response:', createResponse.data);
    } catch (createError) {
      if (createError.response?.status === 400 && createError.response?.data?.message?.includes('already registered')) {
        console.log('ℹ️  Admin user already exists');
      } else {
        console.log('❌ Error creating admin:', createError.response?.data || createError.message);
      }
    }
    
    console.log('\n2️⃣ Testing admin login...');
    
    // Now test the login
    const loginData = {
      email: 'admin@facto.org.in',
      password: 'admin123'
    };
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, loginData);
      console.log('✅ Login successful!');
      console.log('Status:', loginResponse.status);
      console.log('User role:', loginResponse.data.data.user.role);
      console.log('Token present:', !!loginResponse.data.data.token);
      console.log('Full response:', JSON.stringify(loginResponse.data, null, 2));
      
    } catch (loginError) {
      console.log('❌ Login failed!');
      console.log('Status:', loginError.response?.status);
      console.log('Status Text:', loginError.response?.statusText);
      console.log('Error Message:', loginError.response?.data?.message || 'No message');
      console.log('Response Data:', loginError.response?.data);
      console.log('Full Error:', loginError.message);
      
      if (loginError.response?.status === 500) {
        console.log('\n🔍 500 Error Analysis:');
        console.log('This indicates a server-side error. Possible causes:');
        console.log('1. Missing JWT_SECRET environment variable');
        console.log('2. Database connection issue');
        console.log('3. Syntax error in admin controller');
        console.log('4. Missing return statement in error handling');
        console.log('5. User exists but has wrong role');
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

testAdminLogin();
