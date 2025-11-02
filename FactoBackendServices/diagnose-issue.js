// Comprehensive diagnostic script to identify the exact issue
const axios = require('axios');

console.log('🔍 COMPREHENSIVE DIAGNOSTIC - FACTOR ADMIN LOGIN ISSUE\n');

async function runDiagnostics() {
  const results = {
    backendHealth: null,
    adminLogin: null,
    corsTest: null,
    networkTest: null
  };

  // Test 1: Backend Health Check
  console.log('1️⃣ Testing Backend Health...');
  try {
    const healthResponse = await axios.get('https://api.facto.org.in/health', {
      timeout: 10000
    });
    results.backendHealth = {
      status: 'SUCCESS',
      statusCode: healthResponse.status,
      data: healthResponse.data
    };
    console.log('✅ Backend is running');
    console.log('   Status:', healthResponse.status);
    console.log('   Data:', healthResponse.data);
  } catch (error) {
    results.backendHealth = {
      status: 'FAILED',
      error: error.message,
      code: error.code
    };
    console.log('❌ Backend health check failed');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
  }

  // Test 2: Admin Login Endpoint
  console.log('\n2️⃣ Testing Admin Login Endpoint...');
  try {
    const loginResponse = await axios.post('https://api.facto.org.in/api/v1/admin/login', {
      email: 'admin@facto.org.in',
      password: 'admin123'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    results.adminLogin = {
      status: 'SUCCESS',
      statusCode: loginResponse.status,
      data: loginResponse.data
    };
    console.log('✅ Admin login endpoint working');
    console.log('   Status:', loginResponse.status);
    console.log('   User Role:', loginResponse.data.data?.user?.role);
  } catch (error) {
    results.adminLogin = {
      status: 'FAILED',
      error: error.message,
      code: error.code,
      statusCode: error.response?.status,
      responseData: error.response?.data
    };
    console.log('❌ Admin login failed');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    console.log('   Status Code:', error.response?.status);
    console.log('   Response Data:', error.response?.data);
  }

  // Test 3: CORS Preflight Test
  console.log('\n3️⃣ Testing CORS Preflight...');
  try {
    const corsResponse = await axios.options('https://api.facto.org.in/api/v1/admin/login', {
      timeout: 10000,
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    results.corsTest = {
      status: 'SUCCESS',
      statusCode: corsResponse.status,
      headers: {
        'Access-Control-Allow-Origin': corsResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': corsResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': corsResponse.headers['access-control-allow-headers']
      }
    };
    console.log('✅ CORS preflight working');
    console.log('   Status:', corsResponse.status);
    console.log('   CORS Headers:', results.corsTest.headers);
  } catch (error) {
    results.corsTest = {
      status: 'FAILED',
      error: error.message,
      code: error.code
    };
    console.log('❌ CORS preflight failed');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
  }

  // Test 4: Network Connectivity
  console.log('\n4️⃣ Testing Network Connectivity...');
  try {
    const networkResponse = await axios.get('https://api.facto.org.in/', {
      timeout: 5000
    });
    results.networkTest = {
      status: 'SUCCESS',
      statusCode: networkResponse.status
    };
    console.log('✅ Network connectivity working');
    console.log('   Status:', networkResponse.status);
  } catch (error) {
    results.networkTest = {
      status: 'FAILED',
      error: error.message,
      code: error.code
    };
    console.log('❌ Network connectivity failed');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
  }

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('========================');
  console.log('Backend Health:', results.backendHealth.status);
  console.log('Admin Login:', results.adminLogin.status);
  console.log('CORS Test:', results.corsTest.status);
  console.log('Network Test:', results.networkTest.status);

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('===================');
  
  if (results.backendHealth.status === 'FAILED') {
    console.log('🔧 Backend server is not running or not accessible');
    console.log('   Solution: Start the backend server with "npm run dev"');
  }
  
  if (results.adminLogin.status === 'FAILED' && results.backendHealth.status === 'SUCCESS') {
    console.log('🔧 Admin login endpoint has issues');
    if (results.adminLogin.statusCode === 500) {
      console.log('   Issue: 500 Internal Server Error');
      console.log('   Solution: Check server logs for errors');
    } else if (results.adminLogin.statusCode === 401) {
      console.log('   Issue: Authentication failed');
      console.log('   Solution: Create admin user or check credentials');
    }
  }
  
  if (results.corsTest.status === 'FAILED') {
    console.log('🔧 CORS configuration issue');
    console.log('   Solution: Check CORS settings in app.ts');
  }
  
  if (results.networkTest.status === 'FAILED') {
    console.log('🔧 Network connectivity issue');
    console.log('   Solution: Check internet connection and server availability');
  }

  return results;
}

runDiagnostics().catch(console.error);
