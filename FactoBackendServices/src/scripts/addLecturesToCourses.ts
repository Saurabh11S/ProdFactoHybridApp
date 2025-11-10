import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Course from '../models/course.model';
import Lecture from '../models/lecture.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Sample lectures data for each course type
const getLecturesForCourse = (courseTitle: string, courseId: string) => {
  const courseTitleLower = courseTitle.toLowerCase();
  
  if (courseTitleLower.includes('itr')) {
    return [
      {
        title: 'Introduction to ITR Filing',
        subtitle: 'Understanding Income Tax Returns and their importance',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 25, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'ITR Forms Explained - ITR-1, ITR-2, ITR-3',
        subtitle: 'Which ITR form to choose based on your income sources',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 30, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Step-by-Step ITR Filing Process',
        subtitle: 'Complete walkthrough of filing ITR online',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 40, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'Common Mistakes in ITR Filing',
        subtitle: 'Avoid these errors to prevent notices from Income Tax Department',
        lectureNumber: 4,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 35, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'Tax Deductions and Exemptions',
        subtitle: 'Maximize your tax savings with proper deductions',
        lectureNumber: 5,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 45, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        courseLevel: 'advanced',
        isFree: false
      }
    ];
  } else if (courseTitleLower.includes('gst')) {
    return [
      {
        title: 'Introduction to GST',
        subtitle: 'Understanding Goods and Services Tax basics',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 30, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'GST Registration Process',
        subtitle: 'Step-by-step guide to register for GST',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 35, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'GSTR-1 Filing - Complete Guide',
        subtitle: 'How to file GSTR-1 return correctly',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 45, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'GSTR-3B Filing - Monthly Returns',
        subtitle: 'Understanding and filing GSTR-3B monthly returns',
        lectureNumber: 4,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 50, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'GST Compliance and Penalties',
        subtitle: 'Avoid penalties and maintain GST compliance',
        lectureNumber: 5,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 40, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        courseLevel: 'advanced',
        isFree: false
      }
    ];
  } else if (courseTitleLower.includes('tax planning') || courseTitleLower.includes('tax')) {
    return [
      {
        title: 'Tax Planning Fundamentals',
        subtitle: 'Understanding the basics of tax planning',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 30, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Investment Options for Tax Savings',
        subtitle: 'ELSS, PPF, NSC and other tax-saving investments',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 40, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'Section 80C Deductions',
        subtitle: 'Maximize deductions under Section 80C',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 35, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'Advanced Tax Planning Strategies',
        subtitle: 'Year-end tax planning and optimization techniques',
        lectureNumber: 4,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 45, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        courseLevel: 'advanced',
        isFree: false
      }
    ];
  } else if (courseTitleLower.includes('registration') || courseTitleLower.includes('company')) {
    return [
      {
        title: 'Company Registration Basics',
        subtitle: 'Understanding different types of business entities',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 30, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Private Limited Company Registration',
        subtitle: 'Step-by-step process to register a Pvt Ltd company',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 40, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'LLP Registration Process',
        subtitle: 'How to register a Limited Liability Partnership',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 35, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'Post-Registration Compliance',
        subtitle: 'Annual filing and compliance requirements',
        lectureNumber: 4,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 45, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        courseLevel: 'advanced',
        isFree: false
      }
    ];
  } else if (courseTitleLower.includes('bookkeeping') || courseTitleLower.includes('accounting') || courseTitleLower.includes('outsourcing')) {
    return [
      {
        title: 'Introduction to Bookkeeping',
        subtitle: 'Understanding the fundamentals of bookkeeping',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 30, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Chart of Accounts Setup',
        subtitle: 'How to set up and organize your accounts',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 35, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Daily Bookkeeping Practices',
        subtitle: 'Recording transactions and maintaining ledgers',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 40, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'Financial Reporting',
        subtitle: 'Creating P&L statements and balance sheets',
        lectureNumber: 4,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 45, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        courseLevel: 'intermediate',
        isFree: false
      }
    ];
  } else {
    // Default lectures for any other course
    return [
      {
        title: 'Introduction',
        subtitle: 'Course introduction and overview',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 25, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Getting Started',
        subtitle: 'Fundamentals and basics',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 30, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Advanced Concepts',
        subtitle: 'Deep dive into advanced topics',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: { value: 40, unit: 'minutes' },
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        courseLevel: 'intermediate',
        isFree: false
      }
    ];
  }
};

async function addLecturesToCourses() {
  try {
    console.log('\n🎓 === ADDING LECTURES TO EXISTING COURSES ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    
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
    
    // Check if this is production database
    const isProductionDB = mongoose.connection.host.includes('mongodb.net') || 
                          mongoose.connection.host.includes('atlas');
    if (isProductionDB) {
      console.log('🌐 Database Type: Production (MongoDB Atlas)');
    } else {
      console.log('💻 Database Type: Local/Development');
    }

    // Find all published courses
    const courses = await Course.find({ status: 'published' });
    console.log(`\n📚 Found ${courses.length} published courses:`);
    
    if (courses.length === 0) {
      console.log('⚠️  No published courses found. Please publish some courses first.');
      await mongoose.connection.close();
      process.exit(0);
    }

    let totalLecturesAdded = 0;
    let coursesUpdated = 0;

    for (const course of courses) {
      console.log(`\n📖 Processing course: ${course.title}`);
      console.log(`   - ID: ${course._id}`);
      console.log(`   - Current lectures: ${course.lectures.length}`);
      
      // Check if course already has lectures
      if (course.lectures.length > 0) {
        // Populate to check if lectures exist
        await course.populate('lectures');
        const existingLectures = course.lectures.filter((l: any) => l !== null);
        
        if (existingLectures.length > 0) {
          console.log(`   ⚠️  Course already has ${existingLectures.length} lectures. Skipping...`);
          continue;
        }
      }

      // Get lectures for this course
      const lectureData = getLecturesForCourse(course.title, course._id.toString());
      console.log(`   📝 Adding ${lectureData.length} lectures...`);

      const createdLectures = [];
      for (const lectureInfo of lectureData) {
        try {
          const lecture = await Lecture.create(lectureInfo);
          createdLectures.push(lecture._id);
          console.log(`   ✅ Created lecture: ${lecture.lectureNumber}. ${lecture.title}`);
          totalLecturesAdded++;
        } catch (error: any) {
          console.error(`   ❌ Error creating lecture "${lectureInfo.title}":`, error.message);
        }
      }

      if (createdLectures.length > 0) {
        // Add lectures to course
        course.lectures.push(...createdLectures);
        course.totalLectures = course.lectures.length;
        await course.save();
        coursesUpdated++;
        console.log(`   ✅ Updated course with ${createdLectures.length} lectures`);
      }
    }

    console.log('\n📊 === SUMMARY ===');
    console.log(`✅ Courses updated: ${coursesUpdated}`);
    console.log(`✅ Total lectures added: ${totalLecturesAdded}`);
    console.log('\n🎓 === LECTURES ADDITION COMPLETE ===\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error adding lectures:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
addLecturesToCourses();

