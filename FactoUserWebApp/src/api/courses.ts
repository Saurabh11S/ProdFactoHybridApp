import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Lecture interface based on backend model
export interface Lecture {
  _id: string;
  title: string;
  subtitle?: string;
  lectureNumber: number;
  language: string;
  subtitleLanguage?: string;
  duration: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  thumbnail: string;
  videoUrl: string;
  courseLevel: string;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

// Course interfaces based on backend models
export interface Course {
  _id: string;
  title: string;
  category: string;
  language: string;
  subtitleLanguage?: string;
  duration: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  totalLectures: number;
  price: number;
  description: string;
  lectures: Lecture[] | string[]; // Can be populated or just IDs
  status: 'draft' | 'published';
  isPurchased?: boolean; // Indicates if the current user has purchased this course
  createdAt: string;
  updatedAt: string;
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: Course[];
}

// Fetch all published courses
export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const url = `${API_BASE_URL}/course`;
    console.log('🔄 Fetching courses from:', url);
    const response = await axios.get(url);
    console.log('📦 Full API Response:', JSON.stringify(response.data, null, 2));
    
    // Handle different response formats
    // Backend returns: { success: true, status: {...}, data: { courses: [...] } }
    // Actual structure: { success: true, data: { courses: [...] }, status: {...}, error: {} }
    let courses: Course[] = [];
    
    if (response.data?.data?.courses && Array.isArray(response.data.data.courses)) {
      courses = response.data.data.courses;
      console.log('✅ Extracted courses from response.data.data.courses:', courses.length);
    } else if (Array.isArray(response.data?.data)) {
      // If data is directly an array
      courses = response.data.data;
      console.log('✅ Extracted courses from response.data.data (array):', courses.length);
    } else if (Array.isArray(response.data)) {
      // If response is directly an array
      courses = response.data;
      console.log('✅ Extracted courses from response.data (array):', courses.length);
    } else if (response.data?.courses && Array.isArray(response.data.courses)) {
      courses = response.data.courses;
      console.log('✅ Extracted courses from response.data.courses:', courses.length);
    } else {
      console.warn('⚠️ Unexpected API response format:', response.data);
      console.warn('Response structure:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        hasDataDataCourses: !!response.data?.data?.courses,
        isDataArray: Array.isArray(response.data?.data),
        isResponseArray: Array.isArray(response.data)
      });
    }
    
    console.log('📋 Courses list:', courses.map(c => ({ 
      id: c._id, 
      title: c.title, 
      category: c.category,
      lectures: c.lectures?.length || 0 
    })));
    
    return courses;
  } catch (error: any) {
    console.error('❌ Error fetching courses:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
      console.error('API URL might be incorrect or backend is not running');
    }
    throw new Error('Failed to fetch courses');
  }
};

// Fetch user's purchased courses
export const fetchUserCourses = async (token: string): Promise<Course[]> => {
  try {
    const response = await axios.get<CourseResponse>(`${API_BASE_URL}/course/my-courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching user courses:', error);
    throw new Error('Failed to fetch user courses');
  }
};

// Fetch course by ID with all lectures
export const fetchCourseById = async (courseId: string, token?: string): Promise<Course> => {
  try {
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    // Include auth token if provided (for purchase status check)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get<{success: boolean; data: Course}>(`${API_BASE_URL}/course/${courseId}/lectures`, {
      headers
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    throw new Error('Failed to fetch course');
  }
};

// Fetch course by ID with all lectures (for purchased courses)
export const fetchCourseByIdWithAllLectures = async (courseId: string, token: string): Promise<Course> => {
  try {
    const response = await axios.get<{success: boolean; data: Course}>(`${API_BASE_URL}/admin/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    throw new Error('Failed to fetch course');
  }
};
