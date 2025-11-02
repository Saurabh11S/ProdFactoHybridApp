// Create sub-services with correct structure for ITR-1 service
const axios = require('axios');

const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1';

async function createCorrectSubServices() {
  console.log('🔧 Creating Sub-Services with Correct Structure...\n');
  
  try {
    // First, get the existing ITR-1 service
    console.log('1️⃣ Getting ITR-1 service...');
    const servicesResponse = await axios.get(`${LOCAL_API_BASE_URL}/services`);
    const services = servicesResponse.data.data.services;
    
    if (services.length === 0) {
      console.log('❌ No services found. Please create a service first.');
      return;
    }
    
    const itrService = services[0]; // Get the first service (ITR-1)
    console.log('✅ Found service:', itrService.title);
    console.log('   Service ID:', itrService._id);
    
    // Login as admin to get a token
    console.log('\n2️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${LOCAL_API_BASE_URL}/admin/login`, {
      email: 'admin@facto.org.in',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    // Create sub-services with correct structure
    console.log('\n3️⃣ Creating sub-services...');
    
    const subServices = [
      {
        serviceCode: 'ITR-1-BASIC',
        title: 'ITR-1 Basic Filing',
        description: 'Basic ITR-1 filing for salaried individuals with simple income sources',
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
            name: 'Bank interest certificates',
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
          },
          {
            name: 'Aadhar card copy',
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
        description: 'Premium ITR-1 filing with additional support and verification',
        features: [
          'Salary income only',
          'Interest from all sources',
          'Standard deduction',
          'Advanced tax calculation',
          'E-filing assistance',
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
          },
          {
            name: 'PAN card copy',
            priceModifier: 0,
            needsQuotation: false,
            inputType: 'checkbox',
            isMultipleSelect: false,
            options: []
          },
          {
            name: 'Aadhar card copy',
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
          'Standard deduction',
          'Advanced tax calculation',
          'E-filing assistance',
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
          },
          {
            name: 'PAN card copy',
            priceModifier: 0,
            needsQuotation: false,
            inputType: 'checkbox',
            isMultipleSelect: false,
            options: []
          },
          {
            name: 'Aadhar card copy',
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
    
    // Create sub-services using admin endpoint
    let createdCount = 0;
    for (const subService of subServices) {
      try {
        const response = await axios.post(
          `${LOCAL_API_BASE_URL}/admin/sub-service/${itrService._id}`,
          subService,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Created: ${subService.title}`);
        console.log(`   ID: ${response.data.data.subService._id}`);
        console.log(`   Price: ₹${subService.price}`);
        createdCount++;
      } catch (error) {
        console.log(`❌ Failed to create: ${subService.title}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        console.log(`   Status: ${error.response?.status}`);
      }
    }
    
    console.log(`\n🎉 Created ${createdCount} sub-services successfully!`);
    
    // Verify the creation
    console.log('\n4️⃣ Verifying sub-services...');
    const verifyResponse = await axios.get(`${LOCAL_API_BASE_URL}/sub-services/all`);
    const subServicesCount = verifyResponse.data.data.subServices.length;
    console.log(`✅ Total sub-services in database: ${subServicesCount}`);
    
    if (subServicesCount > 0) {
      console.log('\n📋 Sub-services in Database:');
      verifyResponse.data.data.subServices.forEach((subService, index) => {
        console.log(`   ${index + 1}. ${subService.title} (${subService.serviceCode})`);
        console.log(`      ID: ${subService._id}`);
        console.log(`      Service ID: ${subService.serviceId}`);
        console.log(`      Price: ₹${subService.price}`);
        console.log(`      Active: ${subService.isActive}`);
        console.log('');
      });
    }
    
    console.log('\n🎉 Sub-services creation complete!');
    console.log('✅ The web app should now display services properly.');
    
  } catch (error) {
    console.error('❌ Error creating sub-services:', error.message);
    if (error.response) {
      console.log('   Response Status:', error.response.status);
      console.log('   Response Data:', error.response.data);
    }
  }
}

createCorrectSubServices();
