/**
 * Script to fix GST sub-services
 * This script will find the GST service and add all missing sub-services
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
      console.log('✅ Login successful!');
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

async function createSubService(serviceId, subServiceData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/sub-service/${serviceId}`,
      subServiceData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.data.success) {
      console.log(`  ✅ Created: ${subServiceData.title}`);
      return true;
    }
    return false;
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists') || 
        error.response?.data?.message?.includes('duplicate')) {
      console.log(`  ⚠️  Already exists: ${subServiceData.title}`);
      return true;
    }
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
    console.error(`  ❌ Error creating ${subServiceData.title}:`, errorMsg);
    if (error.response?.data) {
      console.error(`  📋 Full error response:`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

const gstSubServices = [
  {
    title: 'GSTR-1 Monthly',
    description: 'Monthly GSTR-1 filing for regular taxpayers',
    serviceCode: 'GSTR1-MONTHLY',
    price: 0,
    period: 'monthly',
    isActive: true,
    features: ['Monthly filing', 'Invoice-wise details'],
    requests: [],
    pricingStructure: [
      { price: 0, period: 'monthly' },
      { price: 0, period: 'quarterly' },
      { price: 0, period: 'yearly' },
    ],
  },
  {
    title: 'GSTR-3B Monthly',
    description: 'Monthly GSTR-3B filing for regular taxpayers',
    serviceCode: 'GSTR3B-MONTHLY',
    price: 0,
    period: 'monthly',
    isActive: true,
    features: ['Monthly filing', 'Summary return'],
    requests: [],
    pricingStructure: [
      { price: 0, period: 'monthly' },
      { price: 0, period: 'quarterly' },
      { price: 0, period: 'yearly' },
    ],
  },
  {
    title: 'GSTR-1/IFF Monthly',
    description: 'Monthly Invoice Furnishing Facility for quarterly filers',
    serviceCode: 'GSTR1-IFF-MONTHLY',
    price: 0,
    period: 'monthly',
    isActive: true,
    features: ['IFF filing', 'Invoice details'],
    requests: [],
    pricingStructure: [
      { price: 0, period: 'monthly' },
      { price: 0, period: 'quarterly' },
      { price: 0, period: 'yearly' },
    ],
  },
  {
    title: 'GSTR-3B Quarterly',
    description: 'Quarterly GSTR-3B filing for regular taxpayers',
    serviceCode: 'GSTR3B-QUARTERLY',
    price: 0,
    period: 'quarterly',
    isActive: true,
    features: ['Quarterly filing', 'Summary return'],
    requests: [],
    pricingStructure: [
      { price: 0, period: 'quarterly' },
      { price: 0, period: 'yearly' },
    ],
  },
  {
    title: 'GSTR- Composition Dealer',
    description: 'GST return filing for composition dealers',
    serviceCode: 'GSTR-COMPOSITION',
    price: 0,
    period: 'quarterly',
    isActive: true,
    features: ['Composition scheme', 'Simplified filing'],
    requests: [],
    pricingStructure: [
      { price: 0, period: 'quarterly' },
      { price: 0, period: 'yearly' },
    ],
  },
  {
    title: 'GSTR-1 vs. Books of Accounts',
    description: 'Reconciliation of GSTR-1 with books of accounts',
    serviceCode: 'GSTR1-RECON-BOOKS',
    price: 0,
    period: 'one_time',
    isActive: true,
    features: ['Reconciliation', 'Books matching'],
    requests: [],
    pricingStructure: [
      { price: 0, period: 'one_time' },
    ],
  },
  {
    title: 'GSTR-2A/2B vs. Books of Accounts',
    description: 'Reconciliation of GSTR-2A/2B with books of accounts',
    serviceCode: 'GSTR2A-RECON-BOOKS',
    price: 0,
    period: 'one_time',
    isActive: true,
    features: ['Reconciliation', 'Input tax credit verification'],
    requests: [],
    pricingStructure: [
      { price: 0, period: 'one_time' },
    ],
  },
  {
    title: 'Other Reconciliations',
    description: 'Other GST related reconciliations and compliance',
    serviceCode: 'GSTR-OTHER-RECON',
    price: 0,
    period: 'one_time',
    isActive: true,
    features: ['Custom reconciliation', 'Compliance support'],
    requests: [],
    pricingStructure: [
      { price: 0, period: 'one_time' },
    ],
  },
];

async function fixGSTSubServices() {
  console.log('🚀 Fixing GST Sub-Services...\n');
  
  if (!(await login())) {
    console.error('❌ Failed to login');
    process.exit(1);
  }

  const gstService = await getGSTService();
  if (!gstService) {
    console.error('❌ GST service not found! Please create it first.');
    process.exit(1);
  }

  console.log(`✅ Found GST service: ${gstService.title} (ID: ${gstService._id})\n`);
  console.log(`📝 Creating ${gstSubServices.length} GST sub-service(s)...\n`);

  for (const subService of gstSubServices) {
    await createSubService(gstService._id, subService);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ GST sub-services fix completed!');
}

fixGSTSubServices().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

