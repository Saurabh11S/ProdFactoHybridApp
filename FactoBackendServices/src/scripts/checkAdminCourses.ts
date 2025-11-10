import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Course from '../models/course.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function checkAdminCourses() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('\n🔍 === CHECKING ADMIN COURSES IN DATABASE ===');
    console.log('📅 Timestamp:', new Date().toISOString());
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
      console.log('🌐 Database Type: Production (MongoDB Atlas)');
    } else {
      console.log('💻 Database Type: Local/Development');
      console.log('⚠️  WARNING: You might be connected to local database!');
    }
    
    // Count all courses
    const totalCourses = await Course.countDocuments();
    console.log(`\n📊 Total courses in database: ${totalCourses}`);
    
    // Get all courses
    const allCourses = await Course.find().lean();
    console.log(`\n📚 All Courses (${allCourses.length}):`);
    
    if (allCourses.length === 0) {
      console.log('❌ NO COURSES FOUND IN DATABASE!');
      console.log('\n💡 To add courses, run:');
      console.log('   npm run add:manual-courses');
    } else {
      allCourses.forEach((course: any, index: number) => {
        console.log(`\n${index + 1}. ${course.title}`);
        console.log(`   ID: ${course._id}`);
        console.log(`   Status: ${course.status}`);
        console.log(`   Category: ${course.category}`);
        console.log(`   Price: ₹${course.price}`);
        console.log(`   Created: ${course.createdAt || 'N/A'}`);
      });
      
      const publishedCount = allCourses.filter((c: any) => c.status === 'published').length;
      const draftCount = allCourses.filter((c: any) => c.status === 'draft').length;
      
      console.log(`\n📊 Status Breakdown:`);
      console.log(`   ✅ Published: ${publishedCount}`);
      console.log(`   📝 Draft: ${draftCount}`);
      
      // Test serialization
      console.log(`\n🧪 Testing JSON Serialization:`);
      try {
        const jsonString = JSON.stringify(allCourses);
        const parsed = JSON.parse(jsonString);
        console.log(`   ✅ Serialization successful`);
        console.log(`   ✅ Parsed back to ${parsed.length} courses`);
        console.log(`   ✅ First course title: ${parsed[0]?.title || 'N/A'}`);
      } catch (error: any) {
        console.log(`   ❌ Serialization failed: ${error.message}`);
      }
    }
    
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    console.log('✅ === CHECK COMPLETE ===\n');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error checking courses:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

checkAdminCourses();

