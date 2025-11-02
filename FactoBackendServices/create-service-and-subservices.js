// Create service and sub-services for testing
const axios = require('axios');

const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1';

async function createServiceAndSubServices() {
  console.log('🔧 Creating Service and Sub-Services...\n');
  
  try {
    // Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${LOCAL_API_BASE_URL}/admin/login`, {
      email: 'admin@facto.org.in',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    // Create a service first
    console.log('\n2️⃣ Creating service...');
    const serviceData = {
      title: 'ITR Filing Services',
      description: 'Professional ITR filing services for individuals',
      category: 'Tax Services',
      features: JSON.stringify([
        'Expert tax consultation',
        'Error-free filing',
        'Document verification',
        'E-filing assistance'
      ])
    };
    
    const serviceResponse = await axios.post(
      `${LOCAL_API_BASE_URL}/admin/service`,
      serviceData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const serviceId = serviceResponse.data.data.service._id;
    console.log('✅ Service created successfully!');
    console.log('   ID:', serviceId);
    console.log('   Title:', serviceResponse.data.data.service.title);
    
    // Create sub-services
    console.log('\n3️⃣ Creating sub-services...');
    const subServices = [
      {
        serviceCode: 'ITR-1-BASIC',
        title: 'ITR-1 Basic Filing',
        description: 'Basic ITR-1 filing for salaried individuals',
        features: [
          'Salary income only',
          'Interest from savings accounts',
          'Standard deduction',
          'Basic tax calculation',
          'E-filing assistance'
        ],
        requests: [
          {
            name: 'Form 16 from employer',
            priceModifier: 0,
            needsQuotation: false,
            inputType: 'checkbox',
            isMultipleSelect: false,
            options: []
          },
          {
            name: 'PAN card copy',
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
      },
      {
        serviceCode: 'ITR-1-PREMIUM',
        title: 'ITR-1 Premium Filing',
        description: 'Premium ITR-1 filing with additional support',
        features: [
          'Salary income only',
          'Interest from all sources',
          'Advanced tax calculation',
          'Document verification',
          'Tax optimization advice',
          'Refund tracking'
        ],
        requests: [
          {
            name: 'Form 16 from employer',
            priceModifier: 0,
            needsQuotation: false,
            inputType: 'checkbox',
            isMultipleSelect: false,
            options: []
          },
          {
            name: 'Bank interest certificates',
            priceModifier: 0,
            needsQuotation: false,
            inputType: 'checkbox',
            isMultipleSelect: false,
            options: []
          },
          {
            name: 'Investment proofs',
            priceModifier: 0,
            needsQuotation: false,
            inputType: 'checkbox',
            isMultipleSelect: false,
            options: []
          }
        ],
        price: 800,
        period: 'one_time',
        isActive: true,
        pricingStructure: [{
          price: 800,
          period: 'one_time'
        }]
      },
      {
        serviceCode: 'ITR-1-EXPRESS',
        title: 'ITR-1 Express Filing',
        description: 'Express ITR-1 filing with same-day processing',
        features: [
          'Salary income only',
          'Interest from all sources',
          'Advanced tax calculation',
          'Same-day processing',
          'Priority support',
          'Refund tracking'
        ],
        requests: [
          {
            name: 'Form 16 from employer',
            priceModifier: 0,
            needsQuotation: false,
            inputType: 'checkbox',
            isMultipleSelect: false,
            options: []
          },
          {
            name: 'All required documents',
            priceModifier: 0,
            needsQuotation: false,
            inputType: 'checkbox',
            isMultipleSelect: false,
            options: []
          }
        ],
        price: 1200,
        period: 'one_time',
        isActive: true,
        pricingStructure: [{
          price: 1200,
          period: 'one_time'
        }]
      }
    ];
    
    let createdCount = 0;
    for (const subService of subServices) {
      try {
        const response = await axios.post(
          `${LOCAL_API_BASE_URL}/admin/sub-service/${serviceId}`,
          subService,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Created: ${subService.title} (${subService.serviceCode})`);
        createdCount++;
      } catch (error) {
        console.log(`❌ Failed to create: ${subService.title}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log(`\n🎉 Created ${createdCount} sub-services successfully!`);
    
    // Verify everything
    console.log('\n4️⃣ Verifying data...');
    const servicesResponse = await axios.get(`${LOCAL_API_BASE_URL}/services`);
    const subServicesResponse = await axios.get(`${LOCAL_API_BASE_URL}/sub-services/all`);
    
    console.log(`✅ Services in database: ${servicesResponse.data.data.services.length}`);
    console.log(`✅ Sub-services in database: ${subServicesResponse.data.data.subServices.length}`);
    
    if (subServicesResponse.data.data.subServices.length > 0) {
      console.log('\n📋 Sub-services:');
      subServicesResponse.data.data.subServices.forEach((subService, index) => {
        console.log(`   ${index + 1}. ${subService.title} (${subService.serviceCode}) - ₹${subService.price}`);
      });
    }
    
    console.log('\n🎉 Setup complete!');
    console.log('✅ The admin app should now work for creating sub-services.');
    console.log('✅ The user web app should now display services properly.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.log('   Response Status:', error.response.status);
      console.log('   Response Data:', error.response.data);
    }
  }
}

createServiceAndSubServices();
