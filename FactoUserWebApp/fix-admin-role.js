// Script to fix admin user role in database
const axios = require('axios');

const API_BASE_URL = 'https://api.facto.org.in/api/v1';

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin user role...\n');
    
    // First, let's create a proper admin user
    console.log('1️⃣ Creating admin user with correct role...');
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
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, loginData);
      console.log('✅ Login successful!');
      console.log('User role:', loginResponse.data.data.user.role);
      console.log('User ID:', loginResponse.data.data.user._id);
      console.log('Token:', loginResponse.data.data.token ? 'Present' : 'Missing');
      
      console.log('\n🎉 Admin login is now working!');
      console.log('You can now login to FactoAdminApp with:');
      console.log('   Email: admin@facto.org.in');
      console.log('   Password: admin123');
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data || loginError.message);
      
      if (loginError.response?.status === 500) {
        console.log('\n💡 The 500 error suggests:');
        console.log('1. Database connection issue');
        console.log('2. Missing JWT_SECRET environment variable');
        console.log('3. User exists but has wrong role');
        console.log('4. Database schema mismatch');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAdminRole();
