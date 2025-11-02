// Simple API connectivity test
const axios = require('axios');

const API_BASE_URL = 'https://api.facto.org.in/api/v1';

async function checkAPI() {
  try {
    console.log('Testing API connectivity...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    console.log('✅ API is reachable');
    console.log('Health response:', healthResponse.data);
    
    // Test admin login endpoint
    console.log('\nTesting admin login endpoint...');
    const loginData = {
      email: 'admin@facto.org.in',
      password: 'admin123'
    };
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, loginData);
      console.log('✅ Login successful!');
      console.log('Response:', loginResponse.data);
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data || loginError.message);
      
      // Try to create admin user
      console.log('\nTrying to create admin user...');
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
        console.log('✅ Admin user created!');
        console.log('Response:', createResponse.data);
        
        // Try login again
        console.log('\nTrying login again...');
        const loginResponse2 = await axios.post(`${API_BASE_URL}/admin/login`, loginData);
        console.log('✅ Login successful after creation!');
        console.log('Response:', loginResponse2.data);
        
      } catch (createError) {
        console.log('❌ Failed to create admin:', createError.response?.data || createError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

checkAPI();
