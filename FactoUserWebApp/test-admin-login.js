// Script to test admin login and create admin if needed
const axios = require('axios');

const API_BASE_URL = 'https://api.facto.org.in/api/v1';

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...\n');
    
    // First, try to create admin user
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
      console.log('✅ Admin user created successfully!');
      console.log('Response:', createResponse.data);
    } catch (createError) {
      if (createError.response?.status === 400 && createError.response?.data?.message?.includes('already registered')) {
        console.log('ℹ️  Admin user already exists');
      } else {
        console.log('❌ Error creating admin:', createError.response?.data || createError.message);
      }
    }
    
    console.log('\n2️⃣ Testing admin login...');
    
    // Now try to login
    const loginData = {
      email: 'admin@facto.org.in',
      password: 'admin123'
    };
    
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, loginData);
    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.data.user);
    console.log('Token:', loginResponse.data.data.token ? 'Present' : 'Missing');
    
    console.log('\n🎉 You can now login to FactoAdminApp with:');
    console.log('   Email: admin@facto.org.in');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 The admin user might not exist. Let me try to create it...');
      
      try {
        const adminData = {
          email: 'admin@facto.org.in',
          password: 'admin123',
          fullName: 'Admin User',
          phoneNumber: '9876543210',
          aadharNumber: '123456789012',
          panNumber: 'ABCDE1234F',
          dateOfBirth: '1990-01-01'
        };
        
        const createResponse = await axios.post(`${API_BASE_URL}/admin/create`, adminData);
        console.log('✅ Admin user created! Now try logging in again.');
        
      } catch (createError) {
        console.error('❌ Failed to create admin user:', createError.response?.data || createError.message);
      }
    }
  }
}

testAdminLogin();
