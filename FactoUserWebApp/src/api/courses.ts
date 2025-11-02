import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

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
  lectures: string[];
  status: 'draft' | 'published';
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
    const response = await axios.get<CourseResponse>(`${API_BASE_URL}/course`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
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

// Fetch course by ID
export const fetchCourseById = async (courseId: string): Promise<Course> => {
  try {
    const response = await axios.get<{success: boolean; data: Course}>(`${API_BASE_URL}/course/${courseId}/lectures`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    throw new Error('Failed to fetch course');
  }
};
