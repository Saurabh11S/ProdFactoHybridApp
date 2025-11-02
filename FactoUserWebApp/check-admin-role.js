// Script to check if the admin user has the correct role
const axios = require('axios');

const API_BASE_URL = 'https://api.facto.org.in/api/v1';

async function checkAdminRole() {
  try {
    console.log('🔍 Checking admin user role...\n');
    
    // First, let's try to create a test admin user to see what happens
    console.log('1️⃣ Testing admin creation...');
    const adminData = {
      email: 'test-admin@facto.org.in',
      password: 'test123',
      fullName: 'Test Admin',
      phoneNumber: '9876543210',
      aadharNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      dateOfBirth: '1990-01-01'
    };
    
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/admin/create`, adminData);
      console.log('✅ Test admin created successfully');
      console.log('Response:', JSON.stringify(createResponse.data, null, 2));
      
      // Now try to login with the test admin
      console.log('\n2️⃣ Testing login with new admin...');
      const loginData = {
        email: 'test-admin@facto.org.in',
        password: 'test123'
      };
      
      const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, loginData);
      console.log('✅ Test admin login successful!');
      console.log('User role:', loginResponse.data.data.user.role);
      
    } catch (createError) {
      if (createError.response?.status === 400 && createError.response?.data?.message?.includes('already registered')) {
        console.log('ℹ️  Test admin already exists');
      } else {
        console.log('❌ Error creating test admin:', createError.response?.data || createError.message);
      }
    }
    
    // Now try to login with the existing admin
    console.log('\n3️⃣ Testing login with existing admin...');
    const existingLoginData = {
      email: 'admin@facto.org.in',
      password: 'admin123'
    };
    
    try {
      const existingLoginResponse = await axios.post(`${API_BASE_URL}/admin/login`, existingLoginData);
      console.log('✅ Existing admin login successful!');
      console.log('User details:', JSON.stringify(existingLoginResponse.data.data.user, null, 2));
      
    } catch (loginError) {
      console.log('❌ Existing admin login failed:', loginError.response?.data || loginError.message);
      
      if (loginError.response?.status === 401) {
        console.log('\n💡 Possible issues:');
        console.log('1. User might not have role: "admin"');
        console.log('2. Password might be different');
        console.log('3. Email might be case-sensitive');
        console.log('4. Database connection issue');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminRole();
