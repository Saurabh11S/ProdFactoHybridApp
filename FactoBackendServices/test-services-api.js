// Test services API specifically
const axios = require('axios');

const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1';

async function testServicesAPI() {
  console.log('🔧 Testing Services API...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:8080/health');
    console.log('✅ Health check successful');
    console.log('   Status:', healthResponse.status);
    
    // Test 2: Services API
    console.log('\n2️⃣ Testing services endpoint...');
    const servicesResponse = await axios.get(`${LOCAL_API_BASE_URL}/services`);
    console.log('✅ Services API response received');
    console.log('   Status:', servicesResponse.status);
    console.log('   Success:', servicesResponse.data.success);
    console.log('   Message:', servicesResponse.data.message);
    console.log('   Services Count:', servicesResponse.data.data?.services?.length || 0);
    
    if (servicesResponse.data.data?.services?.length > 0) {
      console.log('\n📋 Services in Database:');
      servicesResponse.data.data.services.forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.title} (${service.category})`);
        console.log(`      ID: ${service._id}`);
        console.log(`      Active: ${service.isActive}`);
        console.log(`      Description: ${service.description}`);
        console.log('');
      });
    } else {
      console.log('❌ No services found in database');
    }
    
    // Test 3: Sub-services API
    console.log('\n3️⃣ Testing sub-services endpoint...');
    try {
      const subServicesResponse = await axios.get(`${LOCAL_API_BASE_URL}/sub-services/all`);
      console.log('✅ Sub-services API response received');
      console.log('   Status:', subServicesResponse.status);
      console.log('   Sub-services Count:', subServicesResponse.data.data?.subServices?.length || 0);
      
      if (subServicesResponse.data.data?.subServices?.length > 0) {
        console.log('\n📋 Sub-services in Database:');
        subServicesResponse.data.data.subServices.forEach((subService, index) => {
          console.log(`   ${index + 1}. ${subService.title} (${subService.serviceCode})`);
          console.log(`      ID: ${subService._id}`);
          console.log(`      Service ID: ${subService.serviceId}`);
          console.log(`      Active: ${subService.isActive}`);
          console.log(`      Price: ${subService.price}`);
          console.log('');
        });
      } else {
        console.log('❌ No sub-services found in database');
      }
    } catch (subServicesError) {
      console.log('❌ Sub-services API failed:', subServicesError.response?.data || subServicesError.message);
    }
    
    // Test 4: Check if services are active
    console.log('\n4️⃣ Checking service status...');
    if (servicesResponse.data.data?.services?.length > 0) {
      const activeServices = servicesResponse.data.data.services.filter(service => service.isActive);
      const inactiveServices = servicesResponse.data.data.services.filter(service => !service.isActive);
      
      console.log(`   Active Services: ${activeServices.length}`);
      console.log(`   Inactive Services: ${inactiveServices.length}`);
      
      if (inactiveServices.length > 0) {
        console.log('\n⚠️  Inactive Services:');
        inactiveServices.forEach(service => {
          console.log(`   - ${service.title} (ID: ${service._id})`);
        });
        console.log('\n💡 Solution: Set isActive to true for these services');
      }
    }
    
    console.log('\n🎉 Services API Test Complete!');
    
  } catch (error) {
    console.error('❌ Error testing services API:', error.message);
    if (error.response) {
      console.log('   Response Status:', error.response.status);
      console.log('   Response Data:', error.response.data);
    }
  }
}

testServicesAPI();
