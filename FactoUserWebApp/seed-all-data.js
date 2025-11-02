// Script to seed the database with sample services and sub-services
const axios = require('axios');

const API_BASE_URL = 'https://api.facto.org.in/api/v1';

async function seedAllData() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Step 1: Seed services
    console.log('1️⃣ Creating sample services...');
    try {
      const servicesResponse = await axios.post(`${API_BASE_URL}/services/seed`);
      console.log('✅ Services created successfully');
      console.log(`   Created ${servicesResponse.data.data.services.length} services`);
    } catch (error) {
      if (error.response?.status === 200) {
        console.log('ℹ️  Services already exist');
      } else {
        throw error;
      }
    }
    
    console.log('');
    
    // Step 2: Seed sub-services
    console.log('2️⃣ Creating sample sub-services...');
    try {
      const subServicesResponse = await axios.post(`${API_BASE_URL}/sub-services/seed`);
      console.log('✅ Sub-services created successfully');
      console.log(`   Created ${subServicesResponse.data.data.subServices.length} sub-services`);
    } catch (error) {
      if (error.response?.status === 200) {
        console.log('ℹ️  Sub-services already exist');
      } else {
        throw error;
      }
    }
    
    console.log('');
    
    // Step 3: Test fetching services
    console.log('3️⃣ Testing services fetch...');
    const servicesTest = await axios.get(`${API_BASE_URL}/services`);
    console.log(`✅ Services API working - Found ${servicesTest.data.data.services.length} services`);
    
    // Step 4: Test fetching sub-services
    console.log('4️⃣ Testing sub-services fetch...');
    const subServicesTest = await axios.get(`${API_BASE_URL}/sub-services/all`);
    console.log(`✅ Sub-services API working - Found ${subServicesTest.data.data.subServices.length} sub-services`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Services: ${servicesTest.data.data.services.length}`);
    console.log(`   - Sub-services: ${subServicesTest.data.data.subServices.length}`);
    
    console.log('\n🔗 You can now test the user web app - services should be visible!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.response?.data || error.message);
    process.exit(1);
  }
}

seedAllData();
