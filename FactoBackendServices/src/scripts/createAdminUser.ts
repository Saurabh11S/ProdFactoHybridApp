import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/user.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Admin user to create
const adminUser = {
  email: 'factoadmin@gmail.com',
  password: 'abc@12345',
  fullName: 'Facto Admin',
  phoneNumber: '9999999999',
  aadharNumber: '123456789012',
  panNumber: 'ABCDE1234F',
  dateOfBirth: new Date('1990-01-01'),
  role: 'admin',
  registrationDate: new Date(),
  lastLogin: null as Date | null
};

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔌 Connecting to MongoDB...');
    
    // Ensure database name is included
    let uriWithOptions = mongoUri.includes('retryWrites') 
      ? mongoUri 
      : `${mongoUri}${mongoUri.includes('?') ? '&' : '?'}retryWrites=true&w=majority`;
    
    // Add database name if missing
    if (!uriWithOptions.match(/\/[^\/\?]+(\?|$)/)) {
      const parts = uriWithOptions.split('?');
      uriWithOptions = parts[0] + '/facto_app' + (parts[1] ? '?' + parts[1] : '');
      console.log('⚠️  Added database name "facto_app" to connection string');
    }
    
    await mongoose.connect(uriWithOptions);
    console.log('✅ Connected to MongoDB successfully!');
    console.log('🗄️  Database:', mongoose.connection.name);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      email: adminUser.email,
      role: 'admin'
    });

    if (existingAdmin) {
      console.log(`\n⚠️  Admin user with email "${adminUser.email}" already exists.`);
      console.log('📝 Updating password...');
      
      // Update password
      existingAdmin.password = adminUser.password;
      await existingAdmin.save();
      
      console.log('✅ Admin user password updated successfully!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: ${adminUser.password}`);
      console.log(`   Role: ${existingAdmin.role}`);
    } else {
      console.log('\n📝 Creating new admin user...');
      
      // Create new admin user
      const newAdmin = await User.create(adminUser);
      
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: ${adminUser.password}`);
      console.log(`   Full Name: ${newAdmin.fullName}`);
      console.log(`   Role: ${newAdmin.role}`);
      console.log(`   ID: ${newAdmin._id}`);
    }

    console.log('\n✅ Admin user setup complete!');
    console.log('🔐 You can now login with:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the function
createAdminUser();

