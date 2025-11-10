import React, { useState, useEffect } from 'react';
import { Lock, Play } from 'lucide-react';
import { Course, Lecture } from '../api/courses';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface CourseContentProps {
  course: Course;
  isMyCourse: boolean;
  onNavigate: (page: PageType) => void;
}

const CourseContent: React.FC<CourseContentProps> = ({
  course,
  isMyCourse,
  onNavigate
}) => {
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  
  // Filter out string IDs and ensure we have Lecture objects
  const lectures = (course.lectures || []).filter(
    (lecture): lecture is Lecture => 
      typeof lecture === 'object' && 'videoUrl' in lecture
  ) as Lecture[];

  useEffect(() => {
    // Set first available lecture as selected
    if (lectures && lectures.length > 0) {
      const firstAvailable = lectures.find((lecture) => lecture.videoUrl);
      if (firstAvailable) {
        setSelectedLecture(firstAvailable);
      }
    }
  }, [lectures]);

  const isLectureLocked = (lecture: Lecture) => {
    // If it's user's course, all lectures are unlocked
    if (isMyCourse) return false;
    // Otherwise, check if lecture is free
    return !lecture.isFree || !lecture.videoUrl;
  };

  const handleLectureSelect = (lecture: Lecture) => {
    if (!isLectureLocked(lecture)) {
      setSelectedLecture(lecture);
    }
  };

  const availableLectures = lectures?.filter(
    (lecture) => lecture.videoUrl
  ).length || 0;

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

  if (!lectures || lectures.length === 0) {
    return (
      <div className="mb-16 px-4 sm:px-6 md:px-10 lg:px-16 pt-6 md:pt-12">
        <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900 dark:text-white mb-6">
          {course.title}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No lectures available for this course yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16 px-4 sm:px-6 md:px-10 lg:px-16 pt-6 md:pt-12">
      <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900 dark:text-white mb-6">
        {course.title}
      </h2>

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

          {/* Course Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                This course includes:
              </h3>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 text-sm space-y-2 mb-6">
                <li>
                  {formatDuration(course.duration)} on-demand videos
                </li>
                <li>Total Lectures: {course.totalLectures}</li>
                <li>Available Lectures: {availableLectures}</li>
                <li>Language: {course.language}</li>
                <li>Category: {course.category}</li>
              </ul>

              {!isMyCourse && (
                <div className="flex gap-3">
                  <button
                    onClick={() => onNavigate('payment')}
                    className="bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-full px-6 py-3 font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Buy Now
                  </button>
                  <button className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-full px-6 py-3 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300">
                    Watch Demo
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                {course.title}
              </h3>
              <div className="flex items-center mb-4">
                <h3 className="text-red-500 text-2xl font-bold">
                  ₹{course.price}
                </h3>
                <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">per course</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Vertical Lecture List */}
        <div className="h-auto lg:min-h-[600px]">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
              Course Lectures
            </h3>
            <div className="overflow-y-auto max-h-[600px] space-y-3">
              {lectures.map((lecture) => {
                const isLocked = isLectureLocked(lecture);
                const isSelected = selectedLecture?._id === lecture._id;

                return (
                  <div
                    key={lecture._id}
                    onClick={() => handleLectureSelect(lecture)}
                    className={`
                      relative bg-black rounded-lg overflow-hidden cursor-pointer transition-all duration-300
                      ${
                        isLocked && !isMyCourse
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:ring-2 hover:ring-[#007AFF] hover:scale-[1.02]'
                      }
                      ${isSelected ? 'ring-2 ring-[#007AFF] scale-[1.02]' : ''}
                    `}
                    style={{ minHeight: '120px' }}
                  >
                    {lecture.videoUrl ? (
                      <video
                        className="w-full h-full object-cover"
                        src={lecture.videoUrl}
                        style={{ 
                          pointerEvents: isLocked ? 'none' : 'auto',
                          minHeight: '120px'
                        }}
                        poster={lecture.thumbnail}
                        muted
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-[120px] flex items-center justify-center bg-gray-800">
                        <span className="text-gray-500 text-sm">No Preview Available</span>
                      </div>
                    )}

                    {(isLocked && !isMyCourse) && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#007AFF] rounded-full flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
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
                        {lecture.isFree && (
                          <span className="text-green-400 text-xs font-medium">Free</span>
                        )}
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
  );
};

export default CourseContent;

