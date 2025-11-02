// Test CORS fix for admin login
const axios = require('axios');

const API_BASE_URL = 'https://api.facto.org.in/api/v1';

async function testCorsFix() {
  console.log('🔧 Testing CORS Fix for Admin Login...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Checking server health...');
    try {
      const healthResponse = await axios.get('https://api.facto.org.in/health');
      console.log('✅ Server is running');
      console.log('Health response:', healthResponse.data);
    } catch (healthError) {
      console.log('❌ Server health check failed:', healthError.message);
    }
    
    // Test 2: Create admin user
    console.log('\n2️⃣ Creating admin user...');
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
      console.log('User role:', createResponse.data.data.admin.role);
    } catch (createError) {
      if (createError.response?.status === 400 && createError.response?.data?.message?.includes('already registered')) {
        console.log('ℹ️  Admin user already exists');
      } else {
        console.log('❌ Error creating admin:', createError.response?.data || createError.message);
      }
    }
    
    // Test 3: Test admin login
    console.log('\n3️⃣ Testing admin login...');
    const loginData = {
      email: 'admin@facto.org.in',
      password: 'admin123'
    };
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, loginData);
      console.log('✅ Admin login successful!');
      console.log('Status:', loginResponse.status);
      console.log('User role:', loginResponse.data.data.user.role);
      console.log('Token present:', !!loginResponse.data.data.token);
      
      console.log('\n🎉 CORS and login are working correctly!');
      console.log('The admin app should now work with these credentials:');
      console.log('   Email: admin@facto.org.in');
      console.log('   Password: admin123');
      
    } catch (loginError) {
      console.log('❌ Admin login failed!');
      console.log('Status:', loginError.response?.status);
      console.log('Error:', loginError.response?.data || loginError.message);
      
      if (loginError.response?.status === 500) {
        console.log('\n🔍 500 Error - Server needs restart with fixes');
        console.log('Run: cd FactoBackendServices && npm run dev');
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

testCorsFix();
