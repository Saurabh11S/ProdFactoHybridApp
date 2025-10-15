import { useState } from 'react';
import { Footer } from './Footer';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface LearningProps {
  onNavigate: (page: PageType) => void;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  duration: string;
  instructor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
}

const courses: Course[] = [
  {
    id: 1,
    title: 'Complete GST Guide for Beginners',
    description: 'Learn everything about GST registration, filing, and compliance from scratch. Perfect for new business owners.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'GST',
    duration: '2h 30m',
    instructor: 'CA Rajesh Kumar',
    level: 'Beginner',
    rating: 4.8,
    students: 1250
  },
  {
    id: 2,
    title: 'Advanced Tax Planning Strategies',
    description: 'Master advanced tax planning techniques to maximize your savings and minimize tax liability legally.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Tax Planning',
    duration: '3h 15m',
    instructor: 'CA Priya Sharma',
    level: 'Advanced',
    rating: 4.9,
    students: 890
  },
  {
    id: 3,
    title: 'Investment Fundamentals',
    description: 'Understand different investment options, risk management, and portfolio building strategies.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Investments',
    duration: '1h 45m',
    instructor: 'Financial Advisor Amit',
    level: 'Beginner',
    rating: 4.7,
    students: 2100
  },
  {
    id: 4,
    title: 'Business Registration & Compliance',
    description: 'Step-by-step guide to register your business and maintain compliance with all legal requirements.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Business',
    duration: '2h 10m',
    instructor: 'Legal Expert Sneha',
    level: 'Intermediate',
    rating: 4.6,
    students: 1560
  },
  {
    id: 5,
    title: 'Financial Statement Analysis',
    description: 'Learn to read and analyze financial statements to make informed business decisions.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Finance',
    duration: '2h 45m',
    instructor: 'CA Vikram Singh',
    level: 'Intermediate',
    rating: 4.8,
    students: 980
  },
  {
    id: 6,
    title: 'Digital Banking & Fintech',
    description: 'Explore modern banking solutions, digital payments, and fintech innovations.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Technology',
    duration: '1h 30m',
    instructor: 'Tech Expert Ravi',
    level: 'Beginner',
    rating: 4.5,
    students: 1750
  }
];

const categories = ['All', 'GST', 'Tax Planning', 'Investments', 'Business', 'Finance', 'Technology'];

export function Learning({ }: LearningProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = selectedCategory === 'All' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Learning Hub</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Master financial concepts with our comprehensive video courses taught by industry experts
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white shadow-lg transform scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => setSelectedCourse(course)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#007AFF] ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {course.duration}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#007AFF] bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#007AFF] transition-colors duration-300">
                  {course.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>By {course.instructor}</span>
                  <span>{course.students} students</span>
                </div>

                <button className="w-full bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Video Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCourse.title}
                </h3>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="aspect-video mb-4">
                  <iframe
                    src={selectedCourse.videoUrl}
                    title={selectedCourse.title}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Duration: {selectedCourse.duration}</span>
                  <span>Instructor: {selectedCourse.instructor}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

