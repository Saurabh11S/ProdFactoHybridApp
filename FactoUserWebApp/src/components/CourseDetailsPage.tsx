import { useState, useEffect } from 'react';
import { Play, ArrowLeft } from 'lucide-react';
import { fetchCourseById, Course, Lecture } from '../api/courses';
import { useAuth } from '../contexts/AuthContext';
<<<<<<< HEAD
import { ConsultationModal } from './ConsultationModal';
=======
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details';

interface CourseDetailsPageProps {
  onNavigate: (page: PageType, serviceId?: string, courseId?: string) => void;
  courseId?: string;
}

export function CourseDetailsPage({ onNavigate, courseId }: CourseDetailsPageProps) {
  const { token } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
  const [showConsultationModal, setShowConsultationModal] = useState(false);
=======
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9

  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const courseData = await fetchCourseById(courseId, token || undefined);
        setCourse(courseData);
        
        // Set first lecture as selected
        const lectures = (courseData.lectures || []).filter(
          (lecture): lecture is Lecture => 
            typeof lecture === 'object' && 'videoUrl' in lecture
        ) as Lecture[];
        
        if (lectures.length > 0) {
          setSelectedLecture(lectures[0]);
        }
      } catch (err: any) {
        console.error('Error loading course details:', err);
        setError('Failed to load course details. Please try again.');
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    loadCourseDetails();
  }, [courseId, token]);

  const formatDuration = (duration: { value: number; unit: string }) => {
    return `${duration.value} ${duration.unit}`;
  };

  const getLevelColor = (level: string) => {
    const levelLower = level.toLowerCase();
    switch (levelLower) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error || 'Course not found'}</div>
          <button 
            onClick={() => onNavigate('learning')}
            className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Filter out string IDs and ensure we have Lecture objects
  const lectures = (course.lectures || []).filter(
    (lecture): lecture is Lecture => 
      typeof lecture === 'object' && 'videoUrl' in lecture
  ) as Lecture[];

  const availableLectures = lectures?.filter(
    (lecture) => lecture.videoUrl
  ).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('learning')}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-[#007AFF] dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Courses
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {course.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {course.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-[3fr,2fr] gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="pb-6 md:pb-12">
            {/* Main Video Player */}
            <div className="relative bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
              {selectedLecture?.videoUrl ? (
                <video
                  key={selectedLecture._id}
                  className="w-full h-full object-cover"
                  src={selectedLecture.videoUrl}
                  poster={selectedLecture.thumbnail}
                  controls
                  controlsList="nodownload"
                  style={{ minHeight: '400px' }}
                />
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <span className="text-gray-400 text-lg">No Video Available</span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Lecture Info */}
            {selectedLecture && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedLecture.lectureNumber}. {selectedLecture.title}
                </h2>
                {selectedLecture.subtitle && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedLecture.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded-full font-medium ${getLevelColor(selectedLecture.courseLevel)}`}>
                    {selectedLecture.courseLevel}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatDuration(selectedLecture.duration)}
                  </span>
                </div>
              </div>
            )}

            {/* Course Details Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                  This course includes:
                </h3>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 text-sm space-y-2">
                  <li>
                    {formatDuration(course.duration)} on-demand videos
                  </li>
                  <li>Total Lectures: {course.totalLectures}</li>
                  <li>Available Lectures: {availableLectures}</li>
                  <li>Language: {course.language}</li>
                  <li>Category: {course.category}</li>
                </ul>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                  Course Information
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <p><strong>Price:</strong> ₹{course.price}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {course.isPurchased ? (
                      <span className="text-green-500 font-medium">Purchased</span>
                    ) : (
                      <span className="text-gray-500 font-medium">Not Purchased</span>
                    )}
                  </p>
                </div>
                {!course.isPurchased && (
                  <button
                    onClick={() => onNavigate('course-payment', undefined, course._id)}
<<<<<<< HEAD
                    className="w-full bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 mb-3"
=======
                    className="w-full bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
                  >
                    Buy Now
                  </button>
                )}
<<<<<<< HEAD
                <button
                  onClick={() => setShowConsultationModal(true)}
                  className="w-full border border-[#007AFF] text-[#007AFF] dark:text-blue-400 px-6 py-3 rounded-lg font-medium hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 transition-all duration-300"
                >
                  Book Free Consultation
                </button>
=======
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
              </div>
            </div>
          </div>

          {/* Sidebar - Vertical Lecture List */}
          <div className="h-auto lg:min-h-[600px]">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                Course Lectures ({lectures.length})
              </h3>
              <div className="overflow-y-auto max-h-[600px] space-y-3">
                {lectures.map((lecture) => {
                  const isSelected = selectedLecture?._id === lecture._id;

                  return (
                    <div
                      key={lecture._id}
                      onClick={() => setSelectedLecture(lecture)}
                      className={`
                        relative bg-black rounded-lg overflow-hidden cursor-pointer transition-all duration-300
                        ${isSelected ? 'ring-2 ring-[#007AFF] scale-[1.02]' : 'hover:ring-2 hover:ring-[#007AFF] hover:scale-[1.02]'}
                      `}
                      style={{ minHeight: '120px' }}
                    >
                      {lecture.videoUrl ? (
                        <video
                          className="w-full h-full object-cover"
                          src={lecture.videoUrl}
                          style={{ minHeight: '120px' }}
                          poster={lecture.thumbnail}
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="w-full h-[120px] flex items-center justify-center bg-gray-800">
                          <span className="text-gray-500 text-sm">No Preview Available</span>
                        </div>
                      )}

                      {/* Lecture Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm font-medium truncate">
                            {lecture.lectureNumber}. {lecture.title}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(lecture.courseLevel)}`}>
                            {lecture.courseLevel}
                          </span>
                        </div>
                        {lecture.subtitle && (
                          <p className="text-gray-300 text-xs truncate">{lecture.subtitle}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-400 text-xs">
                            {formatDuration(lecture.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
<<<<<<< HEAD

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        category="course"
        itemName={course?.title}
      />
=======
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
    </div>
  );
}

