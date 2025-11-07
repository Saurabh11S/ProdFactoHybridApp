/**
 * Script to remove irrelevant services and sub-services from MongoDB
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

async function getAllServices() {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/service`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data.data.services || [];
  } catch (error) {
    console.error('❌ Error fetching services:', error.message);
    return [];
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
    return [];
  }
}

async function deleteSubService(subServiceId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/sub-service/${subServiceId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data.success;
  } catch (error) {
    console.error(`  ❌ Error deleting sub-service:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function deleteService(serviceId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/service/${serviceId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data.success;
  } catch (error) {
    console.error(`  ❌ Error deleting service:`, error.response?.data?.message || error.message);
    return false;
  }
}

function isIrrelevantService(service) {
  const title = (service.title || '').toLowerCase();
  const category = (service.category || '').toLowerCase();
  
  // Services to keep (these are the correct ones)
  const validServices = [
    'itr',
    'gst',
    'registration',
    'tax planning',
    'outsourcing'
  ];
  
  // Check if it's a valid service
  if (validServices.includes(title)) {
    return false;
  }
  
  // Check for duplicate/incorrect services
  if (category === 'tax filing') {
    // These are duplicates - the actual ITR and GST services exist
    if (title.includes('income tax return') || title.includes('itr') || title.includes('gst')) {
      return true;
    }
  }
  
  // Check for duplicate GST service
  if (title.includes('goods and service tax') || title.includes('goods and servi')) {
    // Keep only the one with category "GST", remove others
    if (category !== 'gst') {
      return true;
    }
  }
  
  // Check for services with wrong category
  if (title === 'gst' && category !== 'gst') {
    return true;
  }
  
  if (title === 'itr' && category !== 'itr') {
    return true;
  }
  
  return false;
}

async function cleanupIrrelevantServices() {
  console.log('🧹 Starting cleanup of irrelevant services and sub-services...\n');
  
  if (!(await login())) {
    console.error('❌ Failed to login');
    process.exit(1);
  }

  const services = await getAllServices();
  const allSubServices = await getAllSubServices();
  
  console.log(`📊 Found ${services.length} services and ${allSubServices.length} sub-services\n`);
  
  // Identify irrelevant services
  const irrelevantServices = [];
  const validServiceIds = new Set();
  
  services.forEach(service => {
    if (isIrrelevantService(service)) {
      irrelevantServices.push(service);
    } else {
      validServiceIds.add(service._id);
    }
  });
  
  if (irrelevantServices.length === 0) {
    console.log('✅ No irrelevant services found. Database is clean!\n');
    return;
  }
  
  console.log(`⚠️  Found ${irrelevantServices.length} irrelevant service(s) to delete:\n`);
  irrelevantServices.forEach((service, index) => {
    console.log(`${index + 1}. ${service.title} (Category: ${service.category})`);
    console.log(`   ID: ${service._id}`);
  });
  
  console.log('\n📋 Checking sub-services for these services...\n');
  
  // Delete sub-services first, then services
  let deletedSubServices = 0;
  let deletedServices = 0;
  let failedDeletions = [];
  
  for (const service of irrelevantServices) {
    console.log(`\n🗑️  Processing: ${service.title}`);
    
    // Get sub-services for this service
    const serviceSubServices = await getSubServicesByServiceId(service._id);
    
    if (serviceSubServices.length > 0) {
      console.log(`   Found ${serviceSubServices.length} sub-service(s) to delete:`);
      
      for (const subService of serviceSubServices) {
        console.log(`   - Deleting sub-service: ${subService.title} (${subService.serviceCode})`);
        if (await deleteSubService(subService._id)) {
          deletedSubServices++;
          console.log(`     ✅ Deleted`);
        } else {
          console.log(`     ❌ Failed to delete`);
          failedDeletions.push(`Sub-service: ${subService.title}`);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } else {
      console.log(`   No sub-services found`);
    }
    
    // Delete the service
    console.log(`   Deleting service: ${service.title}`);
    if (await deleteService(service._id)) {
      deletedServices++;
      console.log(`   ✅ Service deleted`);
    } else {
      console.log(`   ❌ Failed to delete service`);
      failedDeletions.push(`Service: ${service.title}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Summary
  console.log('\n' + '═'.repeat(75));
  console.log('                              CLEANUP SUMMARY');
  console.log('═'.repeat(75));
  console.log(`\n✅ Deleted Services:     ${deletedServices}`);
  console.log(`✅ Deleted Sub-Services: ${deletedSubServices}`);
  
  if (failedDeletions.length > 0) {
    console.log(`\n❌ Failed Deletions: ${failedDeletions.length}`);
    failedDeletions.forEach(item => console.log(`   - ${item}`));
  }
  
  // Verify cleanup
  console.log('\n🔍 Verifying cleanup...\n');
  const remainingServices = await getAllServices();
  const remainingSubServices = await getAllSubServices();
  
  console.log(`📊 Remaining Services:     ${remainingServices.length}`);
  console.log(`📊 Remaining Sub-Services: ${remainingSubServices.length}`);
  
  // Show remaining services
  console.log('\n📋 Remaining Services:');
  remainingServices.forEach((service, index) => {
    console.log(`${index + 1}. ${service.title} (${service.category})`);
  });
  
  console.log('\n✅ Cleanup completed!\n');
}

cleanupIrrelevantServices().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

