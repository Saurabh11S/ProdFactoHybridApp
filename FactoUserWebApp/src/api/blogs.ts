import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Blog interfaces based on backend models
export interface Blog {
  _id: string;
  title: string;
  content: string;
  contentType: 'image' | 'video';
  contentUrl: string;
  reference: {
    title: string;
    url: string;
  };
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // For backward compatibility with old Updates component
  imageUrl?: string; // Alias for contentUrl when contentType is 'image'
}

export interface BlogResponse {
  success: boolean;
  message: string;
  data: {
    blogs: Blog[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBlogs: number;
    };
  };
}

export interface SingleBlogResponse {
  success: boolean;
  message: string;
  data: {
    blog: Blog;
  };
}

// Fetch blogs with pagination and filters
export const fetchBlogs = async (page = 1, limit = 10, search = '', tag = ''): Promise<{blogs: Blog[], pagination: any}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(tag && { tag })
    });

    const url = `${API_BASE_URL}/blogs?${params}`;
    console.log('🔄 Fetching blogs from:', url);
    const response = await axios.get<BlogResponse>(url);
    console.log('📦 Blogs API Response:', response.data);
    
    // Handle response structure: { success: true, data: { blogs: [...], pagination: {...} } }
    if (response.data?.data) {
      return {
        blogs: response.data.data.blogs || [],
        pagination: response.data.data.pagination || {}
      };
    }
    
    console.warn('⚠️ Unexpected API response format:', response.data);
    return {
      blogs: [],
      pagination: {}
    };
  } catch (error: any) {
    console.error('❌ Error fetching blogs:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to fetch blogs');
  }
};

// Fetch blog by ID
export const fetchBlogById = async (id: string): Promise<Blog> => {
  try {
    const url = `${API_BASE_URL}/blogs/${id}`;
    console.log('🔄 Fetching blog by ID from:', url);
    const response = await axios.get<SingleBlogResponse>(url);
    console.log('📦 Single Blog API Response:', response.data);
    
    // Handle response structure: { success: true, data: { blog: {...} } }
    if (response.data?.data?.blog) {
      return response.data.data.blog;
    }
    
    throw new Error('Blog not found in response');
  } catch (error: any) {
    console.error('❌ Error fetching blog by ID:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to fetch blog');
  }
};
