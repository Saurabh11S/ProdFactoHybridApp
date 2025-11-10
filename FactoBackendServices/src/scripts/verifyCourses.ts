import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Course from '../models/course.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function verifyCourses() {
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
    }
    
    await mongoose.connect(uriWithOptions);
    console.log('✅ Connected to MongoDB successfully!');
    console.log('🗄️  Database:', mongoose.connection.name);

    // Get all courses
    const allCourses = await Course.find();
    console.log(`\n📊 Total courses in database: ${allCourses.length}`);

    // Get published courses
    const publishedCourses = await Course.find({ status: 'published' });
    console.log(`✅ Published courses: ${publishedCourses.length}`);
    console.log(`❌ Draft courses: ${allCourses.length - publishedCourses.length}`);

    if (publishedCourses.length > 0) {
      console.log('\n📚 Published Courses:');
      publishedCourses.forEach((course, index) => {
        console.log(`\n${index + 1}. ${course.title}`);
        console.log(`   ID: ${course._id}`);
        console.log(`   Status: ${course.status}`);
        console.log(`   Category: ${course.category}`);
        console.log(`   Price: ₹${course.price}`);
        console.log(`   Total Lectures: ${course.totalLectures}`);
        console.log(`   Created: ${course.createdAt}`);
      });
    } else {
      console.log('\n⚠️  No published courses found!');
      console.log('\n📝 All courses:');
      allCourses.forEach((course, index) => {
        console.log(`\n${index + 1}. ${course.title}`);
        console.log(`   Status: ${course.status} ${course.status !== 'published' ? '⚠️' : ''}`);
        console.log(`   Category: ${course.category}`);
      });
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error verifying courses:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the function
verifyCourses();

