/**
 * Script to link existing GST sub-services to the GST service
 */

import axios from 'axios';

const API_BASE_URL = 'https://facto-backend-api.onrender.com/api/v1';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@facto.org.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let token = '';

const gstServiceCodes = [
  'GSTR1-MONTHLY',
  'GSTR3B-MONTHLY',
  'GSTR1-IFF-MONTHLY',
  'GSTR3B-QUARTERLY',
  'GSTR-COMPOSITION',
  'GSTR1-RECON-BOOKS',
  'GSTR2A-RECON-BOOKS',
  'GSTR-OTHER-RECON',
];

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

async function getAllSubServices() {
  try {
    // Use public endpoint to get all sub-services
    const response = await axios.get(`${API_BASE_URL}/sub-services/all`);
    return response.data.data.subServices || [];
  } catch (error) {
    console.error('❌ Error fetching sub-services:', error.message);
    return [];
  }
}

async function updateSubService(subServiceId, updateData) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/sub-service/${subServiceId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.data.success) {
      return true;
    }
    return false;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
    console.error(`  ❌ Error:`, errorMsg);
    return false;
  }
}

async function linkGSTSubServices() {
  console.log('🔗 Linking GST Sub-Services to GST Service...\n');
  
  if (!(await login())) {
    console.error('❌ Failed to login');
    process.exit(1);
  }

  const gstService = await getGSTService();
  if (!gstService) {
    console.error('❌ GST service not found!');
    process.exit(1);
  }

  console.log(`✅ Found GST service: ${gstService.title} (ID: ${gstService._id})\n`);

  const allSubServices = await getAllSubServices();
  console.log(`📊 Found ${allSubServices.length} total sub-service(s)\n`);

  let linkedCount = 0;
  let activatedCount = 0;

  for (const serviceCode of gstServiceCodes) {
    const subService = allSubServices.find(sub => sub.serviceCode === serviceCode);
    
    if (!subService) {
      console.log(`⚠️  Sub-service with code "${serviceCode}" not found`);
      continue;
    }

    const isLinked = subService.serviceId === gstService._id || 
                     (subService.serviceId?._id === gstService._id) ||
                     (typeof subService.serviceId === 'string' && subService.serviceId === gstService._id);
    
    const needsUpdate = !isLinked || !subService.isActive;

    if (!needsUpdate) {
      console.log(`✅ ${subService.title} - Already linked and active`);
      continue;
    }

    console.log(`🔧 Updating ${subService.title}...`);
    
    const updateData = {
      serviceId: gstService._id,
      isActive: true,
    };

    if (await updateSubService(subService._id, updateData)) {
      console.log(`  ✅ Updated successfully`);
      if (!isLinked) linkedCount++;
      if (!subService.isActive) activatedCount++;
    } else {
      console.log(`  ❌ Failed to update`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n✅ Linking completed!`);
  console.log(`   Linked: ${linkedCount} sub-service(s)`);
  console.log(`   Activated: ${activatedCount} sub-service(s)`);
}

linkGSTSubServices().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

