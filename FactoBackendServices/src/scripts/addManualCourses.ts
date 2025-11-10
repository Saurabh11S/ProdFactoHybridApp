import mongoose, { Document } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Course from '../models/course.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// 5 Manual Courses to be added - These will be configurable from Admin App
const manualCourses = [
  {
    title: 'Complete ITR Filing Guide 2024',
    category: 'ITR',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 2.5,
      unit: 'hours'
    },
    price: 2499,
    description: 'Master the complete process of filing Income Tax Returns (ITR) for FY 2023-24. Learn about different ITR forms, deductions, exemptions, and step-by-step filing procedures. Perfect for salaried individuals, freelancers, and small business owners.',
    totalLectures: 1, // Minimum required, will be updated when lectures are added from Admin App
    status: 'published' as const, // Published so it appears in both Admin and User apps
    lectures: [] as mongoose.Types.ObjectId[] // Empty initially, will be configured from Admin App
  },
  {
    title: 'GST Return Filing - GSTR-1, GSTR-3B Complete Guide',
    category: 'GST',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 3,
      unit: 'hours'
    },
    price: 3499,
    description: 'Comprehensive guide to filing GST returns including GSTR-1 (outward supplies) and GSTR-3B (monthly summary). Learn about input tax credit, reverse charge mechanism, and common filing errors to avoid. Essential for all GST-registered businesses.',
    totalLectures: 1, // Minimum required, will be updated when lectures are added from Admin App
    status: 'published' as const,
    lectures: [] as mongoose.Types.ObjectId[]
  },
  {
    title: 'Tax Planning & Savings Strategies for FY 2024-25',
    category: 'Tax Planning',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 2,
      unit: 'hours'
    },
    price: 2999,
    description: 'Learn effective tax planning strategies to maximize your savings under the new tax regime. Understand Section 80C, 80D, HRA, LTA, and other deductions. Includes investment options, insurance planning, and year-end tax-saving tips.',
    totalLectures: 1, // Minimum required, will be updated when lectures are added from Admin App
    status: 'published' as const,
    lectures: [] as mongoose.Types.ObjectId[]
  },
  {
    title: 'Company Registration & Compliance Essentials',
    category: 'Registration',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 1.5,
      unit: 'hours'
    },
    price: 1999,
    description: 'Step-by-step guide to registering your company in India. Learn about Private Limited, LLP, and One Person Company registration. Understand compliance requirements, annual filings, and ongoing obligations. Perfect for new entrepreneurs.',
    totalLectures: 1, // Minimum required, will be updated when lectures are added from Admin App
    status: 'published' as const,
    lectures: [] as mongoose.Types.ObjectId[]
  },
  {
    title: 'Bookkeeping & Accounting for Small Businesses',
    category: 'Outsourcing',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 2.5,
      unit: 'hours'
    },
    price: 2799,
    description: 'Master bookkeeping and accounting fundamentals for small businesses. Learn to maintain proper books of accounts, understand financial statements, manage cash flow, and prepare for tax filing. Includes practical examples and templates.',
    totalLectures: 1, // Minimum required, will be updated when lectures are added from Admin App
    status: 'published' as const,
    lectures: [] as mongoose.Types.ObjectId[]
  }
];

async function addManualCourses() {
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

    let coursesCreated = 0;
    let coursesSkipped = 0;

    // Create courses
    for (const courseData of manualCourses) {
      // Check if course already exists
      const existingCourse = await Course.findOne({ title: courseData.title });
      if (existingCourse) {
        console.log(`⏭️  Course "${courseData.title}" already exists, skipping...`);
        coursesSkipped++;
        continue;
      }

      // Create course
      const course = await Course.create(courseData);
      coursesCreated++;
      console.log(`✅ Created course: ${courseData.title}`);
      console.log(`   - Category: ${courseData.category}`);
      console.log(`   - Price: ₹${courseData.price}`);
      console.log(`   - Status: ${courseData.status}`);
      console.log(`   - Duration: ${courseData.duration.value} ${courseData.duration.unit}`);
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Courses created: ${coursesCreated}`);
    console.log(`   ⏭️  Courses skipped (already exist): ${coursesSkipped}`);
    console.log(`   📝 Total courses processed: ${manualCourses.length}`);
    
    if (coursesCreated > 0) {
      console.log('\n✅ Manual courses added successfully!');
      console.log('📱 These courses will now appear in:');
      console.log('   - Admin App: Courses section (for configuration)');
      console.log('   - User Web App: Learning section (for enrollment)');
    } else {
      console.log('\n⚠️  No new courses were added. All courses may already exist.');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error adding manual courses:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the function
addManualCourses();

