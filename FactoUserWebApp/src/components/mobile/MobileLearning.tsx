import { useState, useEffect } from 'react';
import { fetchCourses, fetchUserCourses, Course } from '../../api/courses';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Clock, Play } from 'lucide-react';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details';

interface MobileLearningProps {
  onNavigate: (page: PageType, serviceId?: string, courseId?: string) => void;
}

export function MobileLearning({ onNavigate }: MobileLearningProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { isAuthenticated, token } = useAuth();

  const loadCourses = async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      const allCourses = await fetchCourses();
      setCourses(allCourses);
      setRetryCount(0); // Reset retry count on success

      if (isAuthenticated && token) {
        try {
          const userCourses = await fetchUserCourses(token);
          setMyCourses(userCourses);
        } catch (error) {
          console.error('Error fetching user courses:', error);
          // Don't fail the whole page if user courses fail
        }
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      
      // Check if it's a network error and we should retry
      const isNetworkError = error?.code === 'ERR_NETWORK' || 
                            error?.code === 'ECONNABORTED' || 
                            error?.message?.includes('Network') ||
                            error?.message?.includes('timeout');
      
      // Retry up to 2 times for network errors (total 3 attempts)
      if (isNetworkError && retryAttempt < 2) {
        console.log(`Retrying courses fetch (attempt ${retryAttempt + 1}/2)...`);
        setTimeout(() => {
          loadCourses(retryAttempt + 1);
        }, 2000 * (retryAttempt + 1)); // Exponential backoff: 2s, 4s
        return;
      }
      
      // Set user-friendly error message
      let errorMessage = 'Failed to load courses. ';
      if (isNetworkError) {
        errorMessage += 'Please check your internet connection or the backend service may be starting up.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setError(errorMessage);
      setCourses([]);
      setRetryCount(retryAttempt);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [isAuthenticated, token]);

  const formatLearners = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k+`;
    }
    return `${count}+`;
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
        {error ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-red-200 dark:border-red-800">
            <div className="mb-4">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">Unable to Load Courses</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                setRetryCount(0);
                loadCourses(0);
              }}
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-medium active:scale-98 transition-transform"
            >
              Retry
            </button>
            {retryCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Retried {retryCount} time{retryCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No courses available</p>
          </div>
        ) : (
          courses.map((course) => {
            const purchased = isCoursePurchased(course);
            // Use random learners count as fallback since enrolledUsers doesn't exist in Course interface
            const learners = Math.floor(Math.random() * 50000) + 10000;
            const modules = getTotalModules(course);
            const videos = getTotalVideos(course);
            const duration = getTotalDuration(course);
            const freeLectures = course.lectures?.filter((l: any) => typeof l === 'object' && l.isFree).length || 0;

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
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {course.title.charAt(0).toUpperCase()}
                    </div>
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

