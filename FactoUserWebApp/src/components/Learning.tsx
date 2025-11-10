import { useState, useEffect } from 'react';
import { Footer } from './Footer';
import { fetchCourses, fetchUserCourses, Course } from '../api/courses';
import { useAuth } from '../contexts/AuthContext';
import { Search } from 'lucide-react';
import CourseContent from './CourseContent';
import { API_BASE_URL } from '../config/apiConfig';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface LearningProps {
  onNavigate: (page: PageType) => void;
}

export function Learning({ onNavigate }: LearningProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        console.log('Fetching courses from API:', `${API_BASE_URL}/course`);
        const allCourses = await fetchCourses();
        console.log('Fetched courses:', allCourses.length, allCourses);
        setCourses(allCourses);
        
        if (allCourses.length > 0) {
          fetchCategories(allCourses);
        } else {
          console.warn('No courses found in API response');
          setCategories([]);
          setActiveCategory('');
        }

        // Fetch user's courses if authenticated
        if (isAuthenticated && token) {
          try {
            const userCourses = await fetchUserCourses(token);
            setMyCourses(userCourses);
            console.log('Fetched user courses:', userCourses.length);
          } catch (error) {
            console.error('Error fetching user courses:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
        setCategories([]);
        setActiveCategory('');
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (activeCategory === 'courses') {
      // Show user's purchased courses
      setFilteredCourses(myCourses);
    } else if (activeCategory === 'All') {
      // Show all courses
      setFilteredCourses(courses);
    } else {
      // Filter by category
      const filtered = courses.filter((course) => course.category === activeCategory);
      setFilteredCourses(filtered);
    }
  }, [activeCategory, courses, myCourses]);

  useEffect(() => {
    // Apply search filter
    if (searchTerm.trim() === '') {
      // Reset to category filter
      if (activeCategory === 'courses') {
        setFilteredCourses(myCourses);
      } else if (activeCategory === 'All') {
        setFilteredCourses(courses);
      } else {
        const filtered = courses.filter((course) => course.category === activeCategory);
        setFilteredCourses(filtered);
      }
    } else {
      // Search across all courses or my courses
      const searchIn = activeCategory === 'courses' ? myCourses : courses;
      const searchFiltered = searchIn.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(searchFiltered);
    }
  }, [searchTerm, activeCategory, courses, myCourses]);

  function fetchCategories(courses: Course[]) {
    console.log('📂 fetchCategories called with courses:', courses.length);
    if (!courses || courses.length === 0) {
      console.warn('⚠️ No courses provided to fetchCategories');
      setCategories([]);
      setActiveCategory('');
      return;
    }
    const uniqueCategories = Array.from(
      new Set(courses.map((course) => course.category))
    );
    console.log('📂 Unique categories found:', uniqueCategories);
    
    // Add 'All' category at the beginning to show all courses
    const categoriesWithAll = ['All', ...uniqueCategories];
    
    // Add 'Your Courses' if user is authenticated and has courses
    if (isAuthenticated && myCourses.length > 0) {
      categoriesWithAll.unshift('courses');
    }
    
    console.log('📂 Final categories:', categoriesWithAll);
    setCategories(categoriesWithAll);
    // Set 'All' as default to show all courses initially
    setActiveCategory('All');
    console.log('📂 Active category set to: All');
  }

  // Update categories when myCourses changes
  useEffect(() => {
    if (courses.length > 0) {
      fetchCategories(courses);
    }
  }, [myCourses.length, isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
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
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                />
              ))
          ) : (
            categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {category === 'courses' ? 'Your Courses' : category}
              </button>
            ))
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white dark:bg-gray-800 rounded-full w-full max-w-2xl px-4 py-3 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none outline-none"
            />
            <button
              type="submit"
              className="ml-3 bg-gradient-to-r from-[#007AFF] to-[#00C897] text-white rounded-full px-6 py-2 text-sm font-medium hover:shadow-lg transition-all duration-300"
            >
              Search
            </button>
          </form>
        </div>

        {/* Courses List */}
        <div>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007AFF]"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseContent
                key={course._id}
                course={course}
                isMyCourse={activeCategory === 'courses'}
                onNavigate={onNavigate}
              />
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {activeCategory === 'courses'
                  ? "You haven't purchased any courses yet."
                  : searchTerm
                  ? `No courses found matching "${searchTerm}"`
                  : 'No courses available in this category.'}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
