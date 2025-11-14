import { useState, useEffect } from 'react';
import { fetchCourses, fetchUserCourses, Course } from '../../api/courses';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/apiConfig';
import axios from 'axios';
import { BookOpen, Clock, Play, Lock } from 'lucide-react';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details';

interface MobileLearningProps {
  onNavigate: (page: PageType, serviceId?: string, courseId?: string) => void;
}

export function MobileLearning({ onNavigate }: MobileLearningProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const allCourses = await fetchCourses();
        setCourses(allCourses);

        if (isAuthenticated && token) {
          try {
            const userCourses = await fetchUserCourses(token);
            setMyCourses(userCourses);
          } catch (error) {
            console.error('Error fetching user courses:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [isAuthenticated, token]);

  const formatLearners = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k+`;
    }
    return `${count}+`;
  };

  const formatDuration = (duration: { value: number; unit: string }) => {
    return `${duration.value}${duration.unit}`;
  };

  const getTotalModules = (course: Course) => {
    return course.lectures?.length || 0;
  };

  const getTotalVideos = (course: Course) => {
    return course.lectures?.filter((l: any) => l.videoUrl).length || 0;
  };

  const getTotalDuration = (course: Course) => {
    // Calculate total duration from lectures
    let totalMinutes = 0;
    course.lectures?.forEach((lecture: any) => {
      if (lecture.duration) {
        if (lecture.duration.unit === 'min' || lecture.duration.unit === 'minutes') {
          totalMinutes += lecture.duration.value;
        } else if (lecture.duration.unit === 'hour' || lecture.duration.unit === 'hours') {
          totalMinutes += lecture.duration.value * 60;
        }
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const isCoursePurchased = (course: Course) => {
    return myCourses.some(c => c._id === course._id);
  };

  const handleCourseClick = (course: Course) => {
    if (isCoursePurchased(course)) {
      onNavigate('course-details', undefined, course._id);
    } else {
      onNavigate('course-details', undefined, course._id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 pt-16">
        <div className="px-4 py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 pt-16">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academy</h1>
      </div>

      {/* Courses List */}
      <div className="px-4 py-4 space-y-4">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No courses available</p>
          </div>
        ) : (
          courses.map((course) => {
            const purchased = isCoursePurchased(course);
            const learners = course.enrolledUsers?.length || Math.floor(Math.random() * 50000) + 10000;
            const modules = getTotalModules(course);
            const videos = getTotalVideos(course);
            const duration = getTotalDuration(course);
            const freeLectures = course.lectures?.filter((l: any) => l.isFree).length || 0;

            return (
              <div
                key={course._id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
              >
                {/* Top Section - Dark Background with Title and Image */}
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {formatLearners(learners)} Learners
                    </p>
                  </div>
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center overflow-hidden ml-4">
                    {course.instructorImage ? (
                      <img
                        src={course.instructorImage}
                        alt={course.instructor || 'Instructor'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {course.instructor?.charAt(0) || 'F'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section - White Background with Details */}
                <div className="p-4 bg-white dark:bg-gray-800">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {course.title}
                  </h4>
                  
                  {/* Course Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{modules} Modules | {videos} Videos</span>
                      {freeLectures > 0 && (
                        <span className="text-blue-600 dark:text-blue-400 ml-1 font-medium">
                          • {freeLectures} Free
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{duration}</span>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCourseClick(course)}
                      className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 active:scale-95 transition-transform"
                    >
                      {purchased ? (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Continue</span>
                        </>
                      ) : (
                        <span>Watch now</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

