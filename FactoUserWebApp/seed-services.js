// Script to seed the database with sample services
const axios = require('axios');

const API_BASE_URL = 'https://api.facto.org.in/api/v1';

async function seedServices() {
  try {
    console.log('Seeding database with sample services...');
    
    const response = await axios.post(`${API_BASE_URL}/services/seed`);
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Now test fetching services
    console.log('\nTesting services fetch...');
    const servicesResponse = await axios.get(`${API_BASE_URL}/services`);
    console.log('Services fetched:', JSON.stringify(servicesResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

seedServices();
