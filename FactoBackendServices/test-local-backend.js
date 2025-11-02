// Test local backend server
const axios = require('axios');

const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1';

async function testLocalBackend() {
  console.log('🔧 Testing Local Backend Server...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:8080/health');
    console.log('✅ Health check successful');
    console.log('   Status:', healthResponse.status);
    console.log('   Data:', healthResponse.data);
    
    // Test 2: Create Admin User
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
      const createResponse = await axios.post(`${LOCAL_API_BASE_URL}/admin/create`, adminData);
      console.log('✅ Admin user created successfully');
      console.log('   User ID:', createResponse.data.data.admin._id);
      console.log('   Role:', createResponse.data.data.admin.role);
    } catch (createError) {
      if (createError.response?.status === 400 && createError.response?.data?.message?.includes('already registered')) {
        console.log('ℹ️  Admin user already exists');
      } else {
        console.log('❌ Error creating admin:', createError.response?.data || createError.message);
      }
    }
    
    // Test 3: Test Admin Login
    console.log('\n3️⃣ Testing admin login...');
    const loginData = {
      email: 'admin@facto.org.in',
      password: 'admin123'
    };
    
    const loginResponse = await axios.post(`${LOCAL_API_BASE_URL}/admin/login`, loginData);
    console.log('✅ Admin login successful!');
    console.log('   Status:', loginResponse.status);
    console.log('   User Role:', loginResponse.data.data.user.role);
    console.log('   Token Present:', !!loginResponse.data.data.token);
    console.log('   User ID:', loginResponse.data.data.user._id);
    
    console.log('\n🎉 LOCAL BACKEND IS WORKING PERFECTLY!');
    console.log('✅ The admin app should now work with these credentials:');
    console.log('   Email: admin@facto.org.in');
    console.log('   Password: admin123');
    console.log('   Backend URL: http://localhost:8080');
    
  } catch (error) {
    console.error('❌ Error testing local backend:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Backend server is not running on localhost:8080');
      console.log('   Solution: Run "npm start" in FactoBackendServices directory');
    }
  }
}

testLocalBackend();
