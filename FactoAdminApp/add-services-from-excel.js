/**
 * Script to add services and sub-services based on Excel sheet data
 * Uses the same API logic as FactoAdminApp
 * 
 * Usage:
 * 1. Make sure backend is running
 * 2. Get admin token by logging in to admin app
 * 3. Set ADMIN_TOKEN environment variable or update the token below
 * 4. Run: node add-services-from-excel.js
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

// Configuration
const API_BASE_URL = 'https://facto-backend-api.onrender.com/api/v1'; // Production backend
// const API_BASE_URL = 'http://localhost:8080/api/v1'; // Local backend

// Admin credentials - you can set these as environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@facto.org.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// Helper function to create admin user
async function createAdmin() {
  try {
    console.log('👤 Attempting to create admin user...');
    const response = await axios.post(
      `${API_BASE_URL}/admin/create`,
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        fullName: 'Admin User',
        phoneNumber: '9876543210',
        aadharNumber: '123456789012',
        panNumber: 'ABCDE1234F',
        dateOfBirth: '1990-01-01',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      console.log('✅ Admin user created successfully!');
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already registered')) {
      console.log('ℹ️  Admin user already exists');
      return true;
    }
    console.error('⚠️  Could not create admin:', error.response?.data?.message || error.message);
    return false;
  }
}

// Helper function to login and get token
async function login() {
  try {
    console.log('🔐 Attempting to login...');
    const response = await axios.post(
      `${API_BASE_URL}/admin/login`,
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success && response.data.data.token) {
      console.log('✅ Login successful!');
      return response.data.data.token;
    } else {
      throw new Error('Login failed: ' + (response.data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Global token variable - will be set after login
let token = ADMIN_TOKEN;

// Helper function to create service
async function createService(serviceData) {
  try {
    const formData = new FormData();
    formData.append('title', serviceData.title);
    formData.append('description', serviceData.description);
    formData.append('category', serviceData.category);
    formData.append('features', JSON.stringify(serviceData.features || []));
    
    // If icon path is provided, add it
    if (serviceData.iconPath && fs.existsSync(serviceData.iconPath)) {
      formData.append('icon', fs.createReadStream(serviceData.iconPath));
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/service`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    if (response.data.success) {
      console.log(`✅ Service created: ${serviceData.title}`);
      return response.data.data.service;
    } else {
      throw new Error(response.data.message || 'Failed to create service');
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log(`⚠️  Service already exists: ${serviceData.title}`);
      // Try to get existing service
      const servicesResponse = await axios.get(
        `${API_BASE_URL}/admin/service`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const existingService = servicesResponse.data.data.services.find(
        s => s.title === serviceData.title
      );
      return existingService;
    }
    console.error(`❌ Error creating service ${serviceData.title}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

// Helper function to create sub-service
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
      console.log(`  ✅ Sub-service created: ${subServiceData.title}`);
      return response.data.data.subService;
    } else {
      throw new Error(response.data.message || 'Failed to create sub-service');
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log(`  ⚠️  Sub-service already exists: ${subServiceData.title}`);
      return null;
    }
    console.error(`  ❌ Error creating sub-service ${subServiceData.title}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

// Service data with main categories and sub-services
const servicesData = [
  // 1. ITR Category
  {
    title: 'ITR',
    description: 'Professional Income Tax Return filing services for individuals and businesses. Expert assistance with ITR-1 to ITR-7.',
    category: 'ITR',
    features: ['Individual Tax Filing', 'Business Tax Filing', 'Tax Planning', 'Refund Assistance'],
    subServices: [
      {
        title: 'ITR 1',
        description: 'ITR-1 for individuals with income from salary, one house property, and other sources',
        serviceCode: 'ITR-1',
        price: 0,
        period: 'one_time',
        features: ['Salary/Pension', 'One house property', 'Other sources'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
      {
        title: 'ITR 2',
        description: 'ITR-2 for individuals and HUFs not having income from business or profession',
        serviceCode: 'ITR-2',
        price: 0,
        period: 'one_time',
        features: [
          'Salary/Pension',
          'More than 1 house property',
          'Other sources',
          'Capital gain',
          'Crypto as capital gain/loss',
          'Holding directorship in a co.',
          'Holding unlisted equity share',
          'Foreign income/assets',
        ],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
      {
        title: 'ITR 3',
        description: 'ITR-3 for individuals and HUFs having income from business or profession',
        serviceCode: 'ITR-3',
        price: 0,
        period: 'one_time',
        features: [
          'Salary/Pension',
          'More than 1 house property',
          'Other sources',
          'Capital gain',
          'Crypto as business income/loss',
          'Holding directorship in a co.',
          'Holding unlisted equity share',
          'Foreign income/assets',
          'Business/Professional income as a partner in firm',
        ],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
      {
        title: 'ITR 4',
        description: 'ITR-4 for individuals and HUFs having income from presumptive business',
        serviceCode: 'ITR-4',
        price: 0,
        period: 'one_time',
        features: [
          'Salary/Pension',
          'One house property',
          'Other sources',
          'Business/Professional income (Presumption)',
        ],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
    ],
  },
  // 2. GST Category
  {
    title: 'GST',
    description: 'Comprehensive GST registration, filing, and compliance services. Stay compliant with India\'s GST regulations.',
    category: 'GST',
    features: ['GST Registration', 'Monthly Filing', 'Annual Returns', 'Compliance Support'],
    subServices: [
      // GSTR MONTHLY Category
      {
        title: 'GSTR-1 Monthly',
        description: 'Monthly GSTR-1 filing for regular taxpayers',
        serviceCode: 'GSTR1-MONTHLY',
        price: 0,
        period: 'monthly',
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
        features: ['Monthly filing', 'Summary return'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'monthly' },
          { price: 0, period: 'quarterly' },
          { price: 0, period: 'yearly' },
        ],
      },
      // GSTR QUARTERLY Category
      {
        title: 'GSTR-1/IFF Monthly',
        description: 'Monthly Invoice Furnishing Facility for quarterly filers',
        serviceCode: 'GSTR1-IFF-MONTHLY',
        price: 0,
        period: 'monthly',
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
        features: ['Quarterly filing', 'Summary return'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'quarterly' },
          { price: 0, period: 'yearly' },
        ],
      },
      // GSTR COMPOSITION DEALER
      {
        title: 'GSTR- Composition Dealer',
        description: 'GST return filing for composition dealers',
        serviceCode: 'GSTR-COMPOSITION',
        price: 0,
        period: 'quarterly',
        features: ['Composition scheme', 'Simplified filing'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'quarterly' },
          { price: 0, period: 'yearly' },
        ],
      },
      // ADDITIONAL SERVICES
      {
        title: 'GSTR-1 vs. Books of Accounts',
        description: 'Reconciliation of GSTR-1 with books of accounts',
        serviceCode: 'GSTR1-RECON-BOOKS',
        price: 0,
        period: 'one_time',
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
        features: ['Custom reconciliation', 'Compliance support'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
    ],
  },
  // 3. Tax Planning Category
  {
    title: 'Tax Planning',
    description: 'Strategic tax planning to minimize your tax liability and maximize savings. Personalized consulting for individuals and businesses.',
    category: 'Tax Planning',
    features: ['Tax Strategy', 'Deduction Planning', 'Year-round Support', 'Expert Consultation'],
    subServices: [
      {
        title: 'Individual Tax Planning',
        description: 'Personalized tax planning strategies for individuals to maximize savings and minimize tax liability',
        serviceCode: 'TAX-PLAN-INDIVIDUAL',
        price: 0,
        period: 'yearly',
        features: ['Tax strategy consultation', 'Deduction optimization', 'Investment planning', 'Year-round support'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'yearly' },
        ],
      },
      {
        title: 'Business Tax Planning',
        description: 'Comprehensive tax planning for businesses to optimize tax structure and compliance',
        serviceCode: 'TAX-PLAN-BUSINESS',
        price: 0,
        period: 'yearly',
        features: ['Business tax strategy', 'Corporate structure optimization', 'Compliance planning', 'Quarterly reviews'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'yearly' },
        ],
      },
      {
        title: 'Tax Notice and Scrutiny Support',
        description: 'Handle tax notices and scrutiny proceedings with expert guidance and legal assistance',
        serviceCode: 'TAX-NOTICE-SUPPORT',
        price: 0,
        period: 'one_time',
        features: ['Notice response', 'Scrutiny support', 'Legal assistance', 'Documentation help'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
    ],
  },
  // 4. Registration Category
  {
    title: 'Registration',
    description: 'Complete business registration services including company incorporation, GST, PAN, and other regulatory compliances.',
    category: 'Registration',
    features: ['Company Registration', 'LLP Setup', 'Partnership Firms', 'Business Licenses'],
    subServices: [
      {
        title: 'Company Registration',
        description: 'Private Limited Company, Public Limited Company, and One Person Company registration services',
        serviceCode: 'REG-COMPANY',
        price: 0,
        period: 'one_time',
        features: ['Company incorporation', 'DIN & DSC', 'MOA & AOA drafting', 'Registration certificate'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
      {
        title: 'LLP Registration',
        description: 'Limited Liability Partnership registration and compliance services',
        serviceCode: 'REG-LLP',
        price: 0,
        period: 'one_time',
        features: ['LLP incorporation', 'Partnership agreement', 'PAN & TAN registration', 'Compliance support'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
      {
        title: 'Partnership Firm Registration',
        description: 'Partnership firm registration and documentation services',
        serviceCode: 'REG-PARTNERSHIP',
        price: 0,
        period: 'one_time',
        features: ['Partnership deed', 'Firm registration', 'PAN registration', 'Bank account assistance'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
      {
        title: 'GST Registration',
        description: 'GST registration for new businesses and existing businesses migrating to GST',
        serviceCode: 'REG-GST',
        price: 0,
        period: 'one_time',
        features: ['GST registration', 'Documentation support', 'GSTIN certificate', 'Compliance guidance'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
      {
        title: 'PAN & TAN Registration',
        description: 'PAN and TAN registration services for individuals and businesses',
        serviceCode: 'REG-PAN-TAN',
        price: 0,
        period: 'one_time',
        features: ['PAN application', 'TAN application', 'Documentation support', 'Quick processing'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'one_time' },
        ],
      },
    ],
  },
  // 5. Outsourcing Category
  {
    title: 'Outsourcing',
    description: 'Professional accounting and bookkeeping outsourcing services to help you focus on your core business operations.',
    category: 'Outsourcing',
    features: ['Bookkeeping', 'Accounting Services', 'Financial Reporting', 'Payroll Management'],
    subServices: [
      {
        title: 'Bookkeeping Services',
        description: 'Complete bookkeeping and accounting services for your business',
        serviceCode: 'OUT-BOOKKEEPING',
        price: 0,
        period: 'monthly',
        features: ['Daily bookkeeping', 'Ledger maintenance', 'Bank reconciliation', 'Monthly reports'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'monthly' },
          { price: 0, period: 'quarterly' },
          { price: 0, period: 'yearly' },
        ],
      },
      {
        title: 'Payroll Management',
        description: 'Complete payroll processing and management services',
        serviceCode: 'OUT-PAYROLL',
        price: 0,
        period: 'monthly',
        features: ['Salary processing', 'PF & ESI compliance', 'TDS calculation', 'Payslip generation'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'monthly' },
          { price: 0, period: 'quarterly' },
          { price: 0, period: 'yearly' },
        ],
      },
      {
        title: 'Financial Reporting',
        description: 'Monthly, quarterly, and annual financial reports and statements',
        serviceCode: 'OUT-REPORTING',
        price: 0,
        period: 'monthly',
        features: ['P&L statements', 'Balance sheets', 'Cash flow statements', 'Management reports'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'monthly' },
          { price: 0, period: 'quarterly' },
          { price: 0, period: 'yearly' },
        ],
      },
      {
        title: 'Tax Compliance Services',
        description: 'Complete tax compliance and filing services outsourcing',
        serviceCode: 'OUT-TAX-COMPLIANCE',
        price: 0,
        period: 'monthly',
        features: ['GST filing', 'TDS compliance', 'Tax return filing', 'Compliance monitoring'],
        requests: [],
        pricingStructure: [
          { price: 0, period: 'monthly' },
          { price: 0, period: 'quarterly' },
          { price: 0, period: 'yearly' },
        ],
      },
    ],
  },
];

// Main function to create all services
async function createAllServices() {
  console.log('🚀 Starting service creation process...\n');
  console.log(`📡 API Base URL: ${API_BASE_URL}\n`);

  // Get authentication token
  if (!token) {
    try {
      // First try to login
      try {
        token = await login();
      } catch (loginError) {
        // If login fails, try to create admin user
        console.log('\n⚠️  Login failed, attempting to create admin user...');
        const adminCreated = await createAdmin();
        if (adminCreated) {
          // Try login again after creating admin
          console.log('🔄 Retrying login...');
          token = await login();
        } else {
          throw loginError;
        }
      }
    } catch (error) {
      console.error('\n❌ Failed to authenticate. Please provide credentials:');
      console.log('   Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
      console.log('   OR set ADMIN_TOKEN environment variable');
      console.log('   OR update the credentials in the script');
      process.exit(1);
    }
  }

  for (const serviceData of servicesData) {
    try {
      console.log(`\n📦 Creating service: ${serviceData.title}`);
      
      // Create main service
      const service = await createService(serviceData);
      
      if (!service || !service._id) {
        console.log(`⚠️  Skipping sub-services for ${serviceData.title} (service not created)`);
        continue;
      }

      // Create sub-services if any
      if (serviceData.subServices && serviceData.subServices.length > 0) {
        console.log(`  📝 Creating ${serviceData.subServices.length} sub-service(s)...`);
        for (const subServiceData of serviceData.subServices) {
          await createSubService(service._id, subServiceData);
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error(`❌ Failed to create service ${serviceData.title}:`, error.message);
      continue;
    }
  }

  console.log('\n✅ Service creation process completed!');
}

// Run the script
createAllServices().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

