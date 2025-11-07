/**
 * Script to list all services and sub-services from MongoDB in a formatted way
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

function formatServicesList() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('                    SERVICES & SUB-SERVICES INVENTORY');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

function formatServiceHeader(service, index, total) {
  console.log('━'.repeat(75));
  console.log(`SERVICE ${index + 1}/${total}: ${service.title.toUpperCase()}`);
  console.log('━'.repeat(75));
  console.log(`   Category:      ${service.category || 'N/A'}`);
  console.log(`   Status:        ${service.isActive ? '✅ Active' : '❌ Inactive'}`);
  console.log(`   Service ID:    ${service._id}`);
  console.log(`   Description:   ${service.description || 'N/A'}`);
  if (service.features && service.features.length > 0) {
    console.log(`   Features:      ${service.features.join(', ')}`);
  }
  console.log('');
}

function formatSubService(subService, index, total) {
  const status = subService.isActive ? '✅' : '❌';
  console.log(`   ${index + 1}. ${subService.title} ${status}`);
  console.log(`      └─ Service Code: ${subService.serviceCode}`);
  console.log(`      └─ Price:        ₹${subService.price || 0}`);
  console.log(`      └─ Period:       ${subService.period || 'N/A'}`);
  console.log(`      └─ Status:       ${subService.isActive ? 'Active' : 'Inactive'}`);
  console.log(`      └─ Description:  ${subService.description || 'N/A'}`);
  if (subService.features && subService.features.length > 0) {
    console.log(`      └─ Features:     ${subService.features.join(', ')}`);
  }
  if (subService.pricingStructure && subService.pricingStructure.length > 0) {
    const pricing = subService.pricingStructure.map(p => `${p.period}: ₹${p.price}`).join(', ');
    console.log(`      └─ Pricing:      ${pricing}`);
  }
  console.log('');
}

function formatSummary(services, allSubServices) {
  console.log('━'.repeat(75));
  console.log('                              SUMMARY');
  console.log('━'.repeat(75));
  
  const totalServices = services.length;
  const activeServices = services.filter(s => s.isActive).length;
  const inactiveServices = services.filter(s => !s.isActive).length;
  
  const totalSubServices = allSubServices.length;
  const activeSubServices = allSubServices.filter(s => s.isActive).length;
  const inactiveSubServices = allSubServices.filter(s => !s.isActive).length;
  
  // Count sub-services per service
  const subServiceCounts = {};
  services.forEach(service => {
    const count = allSubServices.filter(sub => {
      if (sub.serviceId && typeof sub.serviceId === 'object') {
        return sub.serviceId._id === service._id;
      }
      return false;
    }).length;
    subServiceCounts[service.title] = count;
  });
  
  console.log(`\n📊 SERVICES:`);
  console.log(`   Total:        ${totalServices}`);
  console.log(`   Active:       ${activeServices}`);
  console.log(`   Inactive:     ${inactiveServices}`);
  
  console.log(`\n📦 SUB-SERVICES:`);
  console.log(`   Total:        ${totalSubServices}`);
  console.log(`   Active:       ${activeSubServices}`);
  console.log(`   Inactive:     ${inactiveSubServices}`);
  
  console.log(`\n📋 SUB-SERVICES PER SERVICE:`);
  Object.entries(subServiceCounts).forEach(([serviceName, count]) => {
    console.log(`   ${serviceName.padEnd(25)} ${count} sub-service(s)`);
  });
  
  // Group by category
  const byCategory = {};
  services.forEach(service => {
    const category = service.category || 'Uncategorized';
    if (!byCategory[category]) {
      byCategory[category] = { services: 0, subServices: 0 };
    }
    byCategory[category].services++;
    byCategory[category].subServices += subServiceCounts[service.title] || 0;
  });
  
  console.log(`\n📂 BY CATEGORY:`);
  Object.entries(byCategory).forEach(([category, counts]) => {
    console.log(`   ${category.padEnd(25)} ${counts.services} service(s), ${counts.subServices} sub-service(s)`);
  });
  
  console.log('\n' + '═'.repeat(75));
}

async function listAllServicesAndSubServices() {
  formatServicesList();
  
  if (!(await login())) {
    console.error('❌ Failed to login');
    process.exit(1);
  }

  const services = await getAllServices();
  const allSubServices = await getAllSubServices();
  
  if (services.length === 0) {
    console.log('⚠️  No services found in the database.');
    return;
  }

  // Sort services by category, then by title
  services.sort((a, b) => {
    if (a.category !== b.category) {
      return (a.category || '').localeCompare(b.category || '');
    }
    return (a.title || '').localeCompare(b.title || '');
  });

  // Display each service with its sub-services
  services.forEach((service, index) => {
    formatServiceHeader(service, index, services.length);
    
    // Get sub-services for this service
    const serviceSubServices = allSubServices.filter(sub => {
      if (sub.serviceId && typeof sub.serviceId === 'object') {
        return sub.serviceId._id === service._id;
      }
      return false;
    });
    
    if (serviceSubServices.length === 0) {
      console.log('   ⚠️  No sub-services found for this service.\n');
    } else {
      // Sort sub-services by title
      serviceSubServices.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      
      console.log(`   📦 SUB-SERVICES (${serviceSubServices.length}):\n`);
      serviceSubServices.forEach((subService, subIndex) => {
        formatSubService(subService, subIndex, serviceSubServices.length);
      });
    }
  });

  formatSummary(services, allSubServices);
}

listAllServicesAndSubServices().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

