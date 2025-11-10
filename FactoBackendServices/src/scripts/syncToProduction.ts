import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Course from '../models/course.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Production MongoDB URI (update this with your actual production URI)
const PRODUCTION_MONGODB_URI = 'mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?retryWrites=true&w=majority&appName=facto-cluster';

async function syncToProduction() {
  try {
    console.log('\n🔄 === SYNCING TO PRODUCTION DATABASE ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    
    // Use production URI from environment or fallback to hardcoded
    const mongoUri = process.env.MONGODB_URI || PRODUCTION_MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found. Please set it in .env file or update PRODUCTION_MONGODB_URI in this script.');
    }

    console.log('🔗 Connecting to production database...');
    console.log('🔗 MongoDB URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
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
    console.log('🏠 Host:', mongoose.connection.host);
    
    // Check if this is production database
    const isProductionDB = mongoose.connection.host.includes('mongodb.net') || 
                          mongoose.connection.host.includes('atlas');
    if (isProductionDB) {
      console.log('🌐 Database Type: Production (MongoDB Atlas) ✅');
    } else {
      console.log('💻 Database Type: Local/Development ⚠️');
      console.log('⚠️  WARNING: This does not appear to be production database!');
    }
    
    // Check courses
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    const draftCourses = await Course.countDocuments({ status: 'draft' });
    
    console.log('\n📊 Current Courses in Database:');
    console.log(`   Total: ${totalCourses}`);
    console.log(`   Published: ${publishedCourses}`);
    console.log(`   Draft: ${draftCourses}`);
    
    if (totalCourses === 0) {
      console.log('\n❌ NO COURSES FOUND!');
      console.log('💡 Run: npm run add:manual-courses');
    } else {
      console.log('\n📚 Courses List:');
      const courses = await Course.find().lean();
      courses.forEach((course: any, index: number) => {
        console.log(`   ${index + 1}. ${course.title} (${course.status})`);
      });
    }
    
    // Test API response format
    console.log('\n🧪 Testing API Response Format:');
    const courses = await Course.find().lean();
    const testResponse = {
      success: true,
      data: courses,
      status: { code: 200, message: 'Courses Fetched Successfully' }
    };
    
    try {
      const jsonString = JSON.stringify(testResponse);
      const parsed = JSON.parse(jsonString);
      console.log('   ✅ JSON serialization successful');
      console.log(`   ✅ Response has ${parsed.data?.length || 0} courses`);
      console.log(`   ✅ First course: ${parsed.data?.[0]?.title || 'N/A'}`);
    } catch (error: any) {
      console.log(`   ❌ Serialization failed: ${error.message}`);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ === SYNC CHECK COMPLETE ===\n');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

syncToProduction();

