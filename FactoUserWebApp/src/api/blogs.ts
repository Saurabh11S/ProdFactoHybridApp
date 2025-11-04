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

    const response = await axios.get<BlogResponse>(`${API_BASE_URL}/blogs?${params}`);
    return {
      blogs: response.data.data.blogs || [],
      pagination: response.data.data.pagination
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error('Failed to fetch blogs');
  }
};

// Fetch blog by ID
export const fetchBlogById = async (id: string): Promise<Blog> => {
  try {
    const response = await axios.get<SingleBlogResponse>(`${API_BASE_URL}/blogs/${id}`);
    return response.data.data.blog;
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    throw new Error('Failed to fetch blog');
  }
};
