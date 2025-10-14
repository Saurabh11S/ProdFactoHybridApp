import React, { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface CoursesSectionProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

export function CoursesSection({ onNavigate }: CoursesSectionProps) {
  const [progressValues, setProgressValues] = useState<number[]>([0, 0, 0, 0]);
  const [visibleCourses, setVisibleCourses] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const courses = [
    {
      title: 'Tax Planning Masterclass',
      instructor: 'CA Rajesh Kumar',
      duration: '4.5 hours',
      lessons: 24,
      progress: 85,
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
      level: 'Intermediate',
      rating: 4.8,
      students: 2547,
      price: '₹2,999',
      originalPrice: '₹4,999'
    },
    {
      title: 'GST Compliance Guide',
      instructor: 'CA Priya Sharma',
      duration: '3.2 hours',
      lessons: 18,
      progress: 60,
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      level: 'Beginner',
      rating: 4.9,
      students: 3421,
      price: '₹1,999',
      originalPrice: '₹3,499'
    },
    {
      title: 'Financial Planning for SMEs',
      instructor: 'CA Vikram Singh',
      duration: '6.1 hours',
      lessons: 32,
      progress: 40,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
      level: 'Advanced',
      rating: 4.7,
      students: 1876,
      price: '₹3,999',
      originalPrice: '₹6,999'
    },
    {
      title: 'ITR Filing Made Simple',
      instructor: 'CA Anita Patel',
      duration: '2.8 hours',
      lessons: 15,
      progress: 95,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
      level: 'Beginner',
      rating: 4.6,
      students: 4523,
      price: '₹1,499',
      originalPrice: '₹2,999'
    }
  ];

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const courseIndex = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCourses(prev => [...new Set([...prev, courseIndex])]);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const courseCards = sectionRef.current?.querySelectorAll('[data-index]');
    courseCards?.forEach(card => observer.observe(card));

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  // Animate progress bars on component mount
  useEffect(() => {
    const animateProgress = () => {
      courses.forEach((course, index) => {
        setTimeout(() => {
          setProgressValues(prev => {
            const newValues = [...prev];
            newValues[index] = course.progress;
            return newValues;
          });
        }, index * 200);
      });
    };

    if (isVisible) {
      const timer = setTimeout(animateProgress, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#007AFF]/10 to-[#FFD166]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#00C897]/10 to-[#007AFF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-full text-sm font-medium text-[#007AFF] dark:text-blue-400 mb-4 backdrop-blur-lg border border-[#007AFF]/20 dark:border-blue-400/20">
            📚 Learn & Grow
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] dark:text-white mb-4">
            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Financial Skills</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn from certified CA experts with our comprehensive courses designed for individuals and businesses in India.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {courses.map((course, index) => (
            <div
              key={index}
              data-index={index}
              className={`group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-500 transform ${
                visibleCourses.includes(index) 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              } hover:-translate-y-2 hover:scale-105`}
              style={{ 
                transitionDelay: visibleCourses.includes(index) ? `${index * 150}ms` : '0ms' 
              }}
            >
              {/* Course Thumbnail */}
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Level Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-lg ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                {/* Discount Badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-[#FFD166] dark:bg-yellow-500 text-[#1F2937] dark:text-gray-800 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-lg">
                    {Math.round(((parseFloat(course.originalPrice.replace('₹', '').replace(',', '')) - 
                                parseFloat(course.price.replace('₹', '').replace(',', ''))) / 
                               parseFloat(course.originalPrice.replace('₹', '').replace(',', ''))) * 100)}% OFF
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-[#1F2937] dark:text-white text-lg mb-2 group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">by {course.instructor}</p>
                </div>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                    </svg>
                    {course.lessons} lessons
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
                    <span className="text-sm font-medium text-[#007AFF] dark:text-blue-400">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#007AFF] to-[#00C897] h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressValues[index]}%` }}
                    ></div>
                  </div>
                </div>

                {/* Rating & Students */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-[#FFD166]' : 'text-gray-300 dark:text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">{course.rating}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">({course.students.toLocaleString()})</span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#007AFF] dark:text-blue-400 text-lg">{course.price}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-sm line-through">{course.originalPrice}</span>
                  </div>
                  <button 
                    onClick={() => onNavigate('login')}
                    className="bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course Categories */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {[
            { name: 'Tax Planning', count: 12, icon: '📊' },
            { name: 'GST Compliance', count: 8, icon: '🏢' },
            { name: 'Financial Planning', count: 15, icon: '💰' },
            { name: 'Audit & Assurance', count: 6, icon: '🔍' }
          ].map((category, index) => (
            <div
              key={index}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700 hover:border-[#007AFF]/30 dark:hover:border-blue-400/30 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
              <h4 className="font-medium text-[#1F2937] dark:text-white mb-1 group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors duration-300">{category.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{category.count} courses</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`text-center bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-2xl p-8 border border-[#007AFF]/20 dark:border-blue-400/20 backdrop-blur-lg relative overflow-hidden transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF]/5 via-[#00C897]/5 to-[#007AFF]/5 opacity-0 hover:opacity-100 transition-opacity duration-700 animate-gradient-x"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
              Start Your Learning Journey Today
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Get unlimited access to all courses with our premium membership. Learn at your own pace with expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => onNavigate('login')}
                className="group bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Start Free Trial
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
              <button 
                onClick={() => onNavigate('learning')}
                className="group border border-[#007AFF] dark:border-blue-400 text-[#007AFF] dark:text-blue-400 px-8 py-3 rounded-lg font-medium hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  View All Courses
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 4s ease infinite;
        }
      `}</style>
    </section>
  );
}