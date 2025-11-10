import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Course from '../models/course.model';
import Lecture from '../models/lecture.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Sample courses data
const sampleCourses = [
  {
    title: 'Complete GST Guide for Beginners',
    category: 'GST',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 2,
      unit: 'hours'
    },
    price: 2999,
    description: 'Learn everything about GST registration, filing, and compliance from scratch. Perfect for new business owners and entrepreneurs who want to understand GST fundamentals.',
    totalLectures: 3,
    status: 'published',
    lectures: [
      {
        title: 'Introduction to GST',
        subtitle: 'Understanding the basics of Goods and Services Tax',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 30,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
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
        duration: {
          value: 45,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'GST Filing and Returns',
        subtitle: 'How to file GST returns correctly',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 45,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'intermediate',
        isFree: false
      }
    ]
  },
  {
    title: 'Advanced Tax Planning Strategies',
    category: 'Tax Planning',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 3,
      unit: 'hours'
    },
    price: 4999,
    description: 'Master advanced tax planning techniques to maximize your savings and minimize tax liability legally. Learn from industry experts about deductions, exemptions, and smart investment strategies.',
    totalLectures: 4,
    status: 'published',
    lectures: [
      {
        title: 'Tax Planning Fundamentals',
        subtitle: 'Understanding tax planning basics',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 40,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Section 80C and Other Deductions',
        subtitle: 'Maximizing deductions under various sections',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 50,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'Investment Strategies for Tax Savings',
        subtitle: 'Smart investment options for tax benefits',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 45,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'advanced',
        isFree: false
      },
      {
        title: 'Tax Planning for Business Owners',
        subtitle: 'Special strategies for business tax planning',
        lectureNumber: 4,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 45,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'advanced',
        isFree: false
      }
    ]
  },
  {
    title: 'Investment Fundamentals',
    category: 'Investments',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 1,
      unit: 'hours'
    },
    price: 1999,
    description: 'Understand different investment options, risk management, and portfolio building strategies. Perfect for beginners who want to start their investment journey.',
    totalLectures: 2,
    status: 'published',
    lectures: [
      {
        title: 'Introduction to Investments',
        subtitle: 'Understanding different investment options',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 30,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Building Your Investment Portfolio',
        subtitle: 'Creating a balanced investment portfolio',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 30,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: false
      }
    ]
  },
  {
    title: 'Business Registration & Compliance',
    category: 'Business',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 2,
      unit: 'hours'
    },
    price: 3499,
    description: 'Step-by-step guide to register your business and maintain compliance with all legal requirements. Learn about company registration, licenses, and ongoing compliance.',
    totalLectures: 3,
    status: 'published',
    lectures: [
      {
        title: 'Types of Business Entities',
        subtitle: 'Understanding different business structures',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 35,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Company Registration Process',
        subtitle: 'Complete guide to company registration',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 40,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'Ongoing Compliance Requirements',
        subtitle: 'Maintaining compliance after registration',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 45,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'intermediate',
        isFree: false
      }
    ]
  },
  {
    title: 'Financial Statement Analysis',
    category: 'Finance',
    language: 'english',
    subtitleLanguage: 'english',
    duration: {
      value: 2,
      unit: 'hours'
    },
    price: 3999,
    description: 'Learn to read and analyze financial statements to make informed business decisions. Understand balance sheets, income statements, and cash flow statements.',
    totalLectures: 3,
    status: 'published',
    lectures: [
      {
        title: 'Understanding Financial Statements',
        subtitle: 'Introduction to financial statements',
        lectureNumber: 1,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 40,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'beginner',
        isFree: true
      },
      {
        title: 'Balance Sheet Analysis',
        subtitle: 'How to read and analyze balance sheets',
        lectureNumber: 2,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 40,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'intermediate',
        isFree: false
      },
      {
        title: 'Income Statement and Cash Flow',
        subtitle: 'Analyzing profitability and cash flow',
        lectureNumber: 3,
        language: 'english',
        subtitleLanguage: 'english',
        duration: {
          value: 40,
          unit: 'minutes'
        },
        // NOTE: Replace these placeholder URLs with actual video URLs from Cloudinary or your video hosting service
        // For thumbnails, you can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        // For videos, upload to Cloudinary and use the video URL
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1280&h=720&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        courseLevel: 'intermediate',
        isFree: false
      }
    ]
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing courses (optional - comment out if you want to keep existing data)
    // await Course.deleteMany({});
    // await Lecture.deleteMany({});
    // console.log('🗑️  Cleared existing courses and lectures');

    let coursesCreated = 0;
    let lecturesCreated = 0;

    // Create courses with lectures
    for (const courseData of sampleCourses) {
      // Check if course already exists
      const existingCourse = await Course.findOne({ title: courseData.title });
      if (existingCourse) {
        console.log(`⏭️  Course "${courseData.title}" already exists, skipping...`);
        continue;
      }

      // Create lectures first
      const lectureIds = [];
      for (const lectureData of courseData.lectures) {
        const lecture = await Lecture.create(lectureData);
        lectureIds.push(lecture._id);
        lecturesCreated++;
        console.log(`  ✅ Created lecture: ${lectureData.title}`);
      }

      // Create course with lecture references
      const { lectures, ...courseFields } = courseData;
      const course = await Course.create({
        ...courseFields,
        lectures: lectureIds,
        totalLectures: lectureIds.length
      });

      coursesCreated++;
      console.log(`✅ Created course: ${courseData.title} with ${lectureIds.length} lectures`);
    }

    console.log('\n📊 Summary:');
    console.log(`   Courses created: ${coursesCreated}`);
    console.log(`   Lectures created: ${lecturesCreated}`);
    console.log('\n✅ Seeding completed successfully!');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedCourses();

