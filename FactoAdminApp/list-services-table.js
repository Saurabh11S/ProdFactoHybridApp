/**
 * Script to list all services and sub-services in tabular format
 */

import axios from 'axios';

const API_BASE_URL = 'https://facto-backend-api.onrender.com/api/v1';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@facto.org.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let token = '';

async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (response.data.success && response.data.data.token) {
      token = response.data.data.token;
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

function createTableRow(columns, widths) {
  let row = '|';
  columns.forEach((col, index) => {
    const value = String(col || '').padEnd(widths[index] || 20);
    row += ` ${value} |`;
  });
  return row;
}

function createSeparator(widths) {
  let separator = '|';
  widths.forEach(width => {
    separator += '-'.repeat(width + 2) + '|';
  });
  return separator;
}

function truncate(str, maxLength) {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
}

async function displayServicesTable() {
  console.log('\n🔐 Logging in...');
  if (!(await login())) {
    console.error('❌ Failed to login');
    process.exit(1);
  }
  console.log('✅ Connected to database\n');

  const services = await getAllServices();
  const allSubServices = await getAllSubServices();

  if (services.length === 0) {
    console.log('⚠️  No services found.');
    return;
  }

  // Sort services by category, then by title
  services.sort((a, b) => {
    if (a.category !== b.category) {
      return (a.category || '').localeCompare(b.category || '');
    }
    return (a.title || '').localeCompare(b.title || '');
  });

  // ============================================================================
  // SERVICES TABLE
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                          SERVICES TABLE');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const serviceWidths = [5, 20, 15, 10, 60, 12];
  const serviceHeaders = ['#', 'Service Title', 'Category', 'Status', 'Description', 'Features'];
  
  console.log(createTableRow(serviceHeaders, serviceWidths));
  console.log(createSeparator(serviceWidths));

  services.forEach((service, index) => {
    const features = (service.features || []).join(', ');
    const row = [
      index + 1,
      truncate(service.title || 'N/A', 18),
      truncate(service.category || 'N/A', 13),
      service.isActive ? '✅ Active' : '❌ Inactive',
      truncate(service.description || 'N/A', 58),
      truncate(features, 10)
    ];
    console.log(createTableRow(row, serviceWidths));
  });

  // ============================================================================
  // SUB-SERVICES TABLE
  // ============================================================================
  console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                       SUB-SERVICES TABLE');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const subServiceWidths = [5, 25, 25, 15, 12, 10, 60];
  const subServiceHeaders = ['#', 'Sub-Service Title', 'Service Code', 'Parent Service', 'Price', 'Period', 'Description'];
  
  console.log(createTableRow(subServiceHeaders, subServiceWidths));
  console.log(createSeparator(subServiceWidths));

  let subServiceIndex = 1;
  services.forEach((service) => {
    const serviceSubServices = allSubServices.filter(sub => {
      if (sub.serviceId && typeof sub.serviceId === 'object') {
        return sub.serviceId._id === service._id;
      }
      return false;
    }).sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    serviceSubServices.forEach((subService) => {
      const parentService = subService.serviceId && typeof subService.serviceId === 'object' 
        ? subService.serviceId.title 
        : 'N/A';
      
      const row = [
        subServiceIndex++,
        truncate(subService.title || 'N/A', 23),
        truncate(subService.serviceCode || 'N/A', 23),
        truncate(parentService, 13),
        `₹${subService.price || 0}`,
        truncate(subService.period || 'N/A', 8),
        truncate(subService.description || 'N/A', 58)
      ];
      console.log(createTableRow(row, subServiceWidths));
    });
  });

  // ============================================================================
  // DETAILED SUB-SERVICES BY SERVICE
  // ============================================================================
  console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                  SUB-SERVICES BY SERVICE');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  services.forEach((service, serviceIndex) => {
    const serviceSubServices = allSubServices.filter(sub => {
      if (sub.serviceId && typeof sub.serviceId === 'object') {
        return sub.serviceId._id === service._id;
      }
      return false;
    }).sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    if (serviceSubServices.length === 0) {
      console.log(`\n${serviceIndex + 1}. ${service.title} (${service.category})`);
      console.log('   ⚠️  No sub-services\n');
      return;
    }

    console.log(`\n${serviceIndex + 1}. ${service.title} (${service.category}) - ${serviceSubServices.length} sub-service(s)`);
    console.log('   ' + '─'.repeat(100));

    const detailWidths = [5, 30, 20, 15, 10, 10];
    const detailHeaders = ['#', 'Sub-Service Title', 'Service Code', 'Price', 'Period', 'Status'];
    
    console.log('   ' + createTableRow(detailHeaders, detailWidths).substring(2));
    console.log('   ' + createSeparator(detailWidths).substring(2));

    serviceSubServices.forEach((subService, subIndex) => {
      const row = [
        subIndex + 1,
        truncate(subService.title || 'N/A', 28),
        truncate(subService.serviceCode || 'N/A', 18),
        `₹${subService.price || 0}`,
        truncate(subService.period || 'N/A', 8),
        subService.isActive ? '✅ Active' : '❌ Inactive'
      ];
      console.log('   ' + createTableRow(row, detailWidths).substring(2));
    });
    console.log('');
  });

  // ============================================================================
  // SUMMARY TABLE
  // ============================================================================
  console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                            SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const summaryWidths = [20, 10, 10, 10];
  const summaryHeaders = ['Category', 'Services', 'Sub-Services', 'Active Sub-Services'];
  
  console.log(createTableRow(summaryHeaders, summaryWidths));
  console.log(createSeparator(summaryWidths));

  // Group by category
  const categoryStats = {};
  services.forEach(service => {
    const category = service.category || 'Uncategorized';
    if (!categoryStats[category]) {
      categoryStats[category] = {
        services: 0,
        subServices: 0,
        activeSubServices: 0
      };
    }
    categoryStats[category].services++;
    
    const serviceSubServices = allSubServices.filter(sub => {
      if (sub.serviceId && typeof sub.serviceId === 'object') {
        return sub.serviceId._id === service._id;
      }
      return false;
    });
    
    categoryStats[category].subServices += serviceSubServices.length;
    categoryStats[category].activeSubServices += serviceSubServices.filter(s => s.isActive).length;
  });

  Object.entries(categoryStats).sort().forEach(([category, stats]) => {
    const row = [
      truncate(category, 18),
      stats.services,
      stats.subServices,
      stats.activeSubServices
    ];
    console.log(createTableRow(row, summaryWidths));
  });

  // Total row
  const totalServices = services.length;
  const totalSubServices = allSubServices.length;
  const totalActiveSubServices = allSubServices.filter(s => s.isActive).length;
  
  console.log(createSeparator(summaryWidths));
  const totalRow = [
    'TOTAL',
    totalServices,
    totalSubServices,
    totalActiveSubServices
  ];
  console.log(createTableRow(totalRow, summaryWidths));

  console.log('\n' + '═'.repeat(110));
}

displayServicesTable().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

