/**
 * Test script to verify the sub-service by ID route is working
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://facto-backend-api.onrender.com/api/v1';
const TEST_SUB_SERVICE_ID = '690b2e130cf662e4cda21c64';

async function testSubServiceRoute() {
  console.log('🧪 Testing Sub-Service Route...\n');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`🔍 Testing Sub-Service ID: ${TEST_SUB_SERVICE_ID}\n`);

  try {
    // Test the route
    const url = `${API_BASE_URL}/sub-services/${TEST_SUB_SERVICE_ID}`;
    console.log(`📤 Making GET request to: ${url}`);
    
    const response = await axios.get(url);
    
    console.log('\n✅ SUCCESS! Route is working');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ ERROR: Route is not working');
    console.error(`Status: ${error.response?.status || 'N/A'}`);
    console.error(`Message: ${error.response?.data?.message || error.message}`);
    console.error(`URL: ${error.config?.url || 'N/A'}`);
    
    if (error.response?.status === 404) {
      console.error('\n💡 Possible causes:');
      console.error('   1. Backend hasn\'t been rebuilt with the new route');
      console.error('   2. Backend server needs to be restarted');
      console.error('   3. Route is not properly registered');
    }
  }
}

testSubServiceRoute();

