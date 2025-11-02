// Script to create a default admin user for FactoAdminApp
const axios = require('axios');

const API_BASE_URL = 'https://api.facto.org.in/api/v1';

async function createAdminUser() {
  try {
    console.log('🔐 Creating default admin user...\n');
    
    const adminData = {
      email: 'admin@facto.org.in',
      password: 'admin123',
      fullName: 'Admin User',
      phoneNumber: '9876543210',
      aadharNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      dateOfBirth: '1990-01-01',
      profilePictureUrl: 'https://via.placeholder.com/150'
    };
    
    console.log('📝 Admin Details:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Name: ${adminData.fullName}`);
    console.log('');
    
    const response = await axios.post(`${API_BASE_URL}/admin/add-admin`, adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    console.log('\n🎉 You can now login to FactoAdminApp with:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already registered')) {
      console.log('ℹ️  Admin user already exists!');
      console.log('\n🔑 Login credentials:');
      console.log('   Email: admin@facto.org.in');
      console.log('   Password: admin123');
    } else {
      console.error('❌ Error creating admin user:', error.response?.data || error.message);
    }
  }
}

createAdminUser();
