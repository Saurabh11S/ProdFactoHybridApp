/**
 * Script to check ITR service and sub-services mapping
 */

import axios from 'axios';

const API_BASE_URL = 'https://facto-backend-api.onrender.com/api/v1';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@facto.org.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let token = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_BASE_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (response.data.success && response.data.data.token) {
      token = response.data.data.token;
      console.log('✅ Login successful!\n');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function getITRService() {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/service`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const itrService = response.data.data.services.find(
      s => s.title === 'ITR' || s.category === 'ITR'
    );
    return itrService;
  } catch (error) {
    console.error('❌ Error fetching services:', error.message);
    return null;
  }
}

async function getAllSubServices() {
  try {
    const response = await axios.get(`${API_BASE_URL}/sub-services/all`);
    return response.data.data.subServices || [];
  } catch (error) {
    console.error('❌ Error fetching sub-services:', error.message);
    return [];
  }
}

async function getSubServicesByServiceId(serviceId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/sub-services/${serviceId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data.data.subServices || [];
  } catch (error) {
    console.error('❌ Error fetching sub-services by service ID:', error.message);
    return [];
  }
}

async function checkITRSubServices() {
  console.log('🔍 Checking ITR Service and Sub-Services Mapping...\n');
  
  if (!(await login())) {
    console.error('❌ Failed to login');
    process.exit(1);
  }

  const itrService = await getITRService();
  if (!itrService) {
    console.error('❌ ITR service not found!');
    process.exit(1);
  }

  console.log(`✅ Found ITR service:`);
  console.log(`   Title: ${itrService.title}`);
  console.log(`   Category: ${itrService.category}`);
  console.log(`   ID: ${itrService._id}`);
  console.log(`   Active: ${itrService.isActive}`);
  console.log(`   Description: ${itrService.description}`);
  console.log(`   Features: ${JSON.stringify(itrService.features || [])}\n`);

  // Get sub-services by service ID (admin endpoint)
  const itrSubServicesByServiceId = await getSubServicesByServiceId(itrService._id);
  console.log(`📊 Sub-services linked via service ID: ${itrSubServicesByServiceId.length}\n`);

  // Get all sub-services and filter for ITR
  const allSubServices = await getAllSubServices();
  const itrSubServices = allSubServices.filter(sub => {
    if (sub.serviceId && typeof sub.serviceId === 'object') {
      return sub.serviceId._id === itrService._id || 
             sub.serviceId.category === 'ITR' ||
             sub.serviceId.title === 'ITR';
    }
    return false;
  });

  console.log(`📊 Found ${itrSubServices.length} ITR sub-service(s) via public endpoint:\n`);
  
  itrSubServices.forEach((sub, index) => {
    console.log(`${index + 1}. ${sub.title}`);
    console.log(`   Service Code: ${sub.serviceCode}`);
    console.log(`   Active: ${sub.isActive}`);
    console.log(`   Price: ${sub.price}`);
    console.log(`   Period: ${sub.period}`);
    if (sub.serviceId && typeof sub.serviceId === 'object') {
      console.log(`   Parent Service: ${sub.serviceId.title} (${sub.serviceId.category})`);
    } else if (typeof sub.serviceId === 'string') {
      console.log(`   Parent Service ID: ${sub.serviceId}`);
    }
    console.log(`   Features: ${JSON.stringify(sub.features || [])}`);
    console.log('');
  });

  const activeITRSubServices = itrSubServices.filter(sub => sub.isActive);
  const inactiveITRSubServices = itrSubServices.filter(sub => !sub.isActive);
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total ITR sub-services: ${itrSubServices.length}`);
  console.log(`   Active: ${activeITRSubServices.length}`);
  console.log(`   Inactive: ${inactiveITRSubServices.length}`);
  
  // Expected ITR sub-services based on the script
  const expectedITRSubServices = [
    'ITR 1',
    'ITR 2',
    'ITR 3',
    'ITR 4',
  ];
  
  console.log(`\n🔍 Comparing with expected sub-services:`);
  const foundTitles = itrSubServices.map(sub => sub.title);
  const missingTitles = expectedITRSubServices.filter(title => !foundTitles.includes(title));
  const extraTitles = foundTitles.filter(title => !expectedITRSubServices.includes(title));
  
  if (missingTitles.length > 0) {
    console.log(`   ⚠️  Missing sub-services: ${missingTitles.join(', ')}`);
  } else {
    console.log(`   ✅ All expected sub-services are present`);
  }
  
  if (extraTitles.length > 0) {
    console.log(`   ℹ️  Extra sub-services found: ${extraTitles.join(', ')}`);
  }
  
  // Check for mismatched service IDs
  if (itrSubServicesByServiceId.length !== itrSubServices.length) {
    console.log(`\n⚠️  WARNING: Service ID count mismatch!`);
    console.log(`   Admin endpoint: ${itrSubServicesByServiceId.length}`);
    console.log(`   Public endpoint: ${itrSubServices.length}`);
  }
}

checkITRSubServices().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

