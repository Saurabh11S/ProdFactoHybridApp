/**
 * Script to check existing GST sub-services and their linkages
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

async function getAllSubServices() {
  try {
    const response = await axios.get(`${API_BASE_URL}/sub-services/all`);
    return response.data.data.subServices || [];
  } catch (error) {
    console.error('❌ Error fetching sub-services:', error.message);
    return [];
  }
}

async function getGSTService() {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/service`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const gstService = response.data.data.services.find(
      s => s.title === 'GST' || s.category === 'GST'
    );
    return gstService;
  } catch (error) {
    console.error('❌ Error fetching services:', error.message);
    return null;
  }
}

async function checkGSTSubServices() {
  console.log('🔍 Checking GST Sub-Services...\n');
  
  if (!(await login())) {
    console.error('❌ Failed to login');
    process.exit(1);
  }

  const gstService = await getGSTService();
  if (!gstService) {
    console.error('❌ GST service not found!');
    process.exit(1);
  }

  console.log(`✅ Found GST service:`);
  console.log(`   Title: ${gstService.title}`);
  console.log(`   Category: ${gstService.category}`);
  console.log(`   ID: ${gstService._id}`);
  console.log(`   Active: ${gstService.isActive}\n`);

  const allSubServices = await getAllSubServices();
  const gstSubServices = allSubServices.filter(sub => {
    // Check if populated serviceId matches GST service
    if (sub.serviceId && typeof sub.serviceId === 'object') {
      return sub.serviceId._id === gstService._id || 
             sub.serviceId.category === 'GST' ||
             sub.serviceId.title === 'GST';
    }
    return false;
  });

  console.log(`📊 Found ${gstSubServices.length} GST sub-service(s):\n`);
  
  gstSubServices.forEach((sub, index) => {
    console.log(`${index + 1}. ${sub.title}`);
    console.log(`   Service Code: ${sub.serviceCode}`);
    console.log(`   Active: ${sub.isActive}`);
    if (sub.serviceId && typeof sub.serviceId === 'object') {
      console.log(`   Parent Service: ${sub.serviceId.title} (${sub.serviceId.category})`);
    }
    console.log('');
  });

  const activeGSTSubServices = gstSubServices.filter(sub => sub.isActive);
  console.log(`\n✅ Active GST sub-services: ${activeGSTSubServices.length}/${gstSubServices.length}`);
  
  if (activeGSTSubServices.length === 0) {
    console.log('\n⚠️  No active GST sub-services found! This is why the GST filter is not showing.');
  }
}

checkGSTSubServices().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

