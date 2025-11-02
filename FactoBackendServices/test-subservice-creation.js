// Test sub-service creation with correct serviceCode
const axios = require('axios');

const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1';

async function testSubServiceCreation() {
  console.log('🔧 Testing Sub-Service Creation...\n');
  
  try {
    // Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${LOCAL_API_BASE_URL}/admin/login`, {
      email: 'admin@facto.org.in',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    // Get the service ID
    console.log('\n2️⃣ Getting service ID...');
    const servicesResponse = await axios.get(`${LOCAL_API_BASE_URL}/services`);
    const serviceId = servicesResponse.data.data.services[0]._id;
    console.log('✅ Service ID:', serviceId);
    
    // Create a test sub-service with correct structure
    console.log('\n3️⃣ Creating test sub-service...');
    const subServiceData = {
      serviceCode: 'ITR-1-TEST',
      title: 'ITR-1 Test Filing',
      description: 'Test ITR-1 filing service',
      features: [
        'Basic tax filing',
        'E-filing assistance',
        'Document verification'
      ],
      requests: [
        {
          name: 'Form 16',
          priceModifier: 0,
          needsQuotation: false,
          inputType: 'checkbox',
          isMultipleSelect: false,
          options: []
        }
      ],
      price: 500,
      period: 'one_time',
      isActive: true,
      pricingStructure: [{
        price: 500,
        period: 'one_time'
      }]
    };
    
    const createResponse = await axios.post(
      `${LOCAL_API_BASE_URL}/admin/sub-service/${serviceId}`,
      subServiceData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Sub-service created successfully!');
    console.log('   ID:', createResponse.data.data.subService._id);
    console.log('   Title:', createResponse.data.data.subService.title);
    console.log('   Service Code:', createResponse.data.data.subService.serviceCode);
    
    // Verify sub-services exist
    console.log('\n4️⃣ Verifying sub-services...');
    const verifyResponse = await axios.get(`${LOCAL_API_BASE_URL}/sub-services/all`);
    const subServicesCount = verifyResponse.data.data.subServices.length;
    console.log(`✅ Total sub-services in database: ${subServicesCount}`);
    
    if (subServicesCount > 0) {
      console.log('\n📋 Sub-services in Database:');
      verifyResponse.data.data.subServices.forEach((subService, index) => {
        console.log(`   ${index + 1}. ${subService.title} (${subService.serviceCode})`);
        console.log(`      ID: ${subService._id}`);
        console.log(`      Price: ₹${subService.price}`);
        console.log(`      Active: ${subService.isActive}`);
        console.log('');
      });
    }
    
    console.log('\n🎉 Sub-service creation test complete!');
    console.log('✅ The admin app should now work properly for creating sub-services.');
    console.log('✅ The user web app should now display services.');
    
  } catch (error) {
    console.error('❌ Error testing sub-service creation:', error.message);
    if (error.response) {
      console.log('   Response Status:', error.response.status);
      console.log('   Response Data:', error.response.data);
    }
  }
}

testSubServiceCreation();
