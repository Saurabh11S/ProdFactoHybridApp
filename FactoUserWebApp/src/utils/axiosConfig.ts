import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import { Capacitor } from '@capacitor/core';

// Create axios instance with proper configuration for mobile
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for mobile networks
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      platform: Capacitor.isNativePlatform() ? 'Mobile' : 'Web',
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
      responseData: error.response?.data,
      networkError: error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED',
    });

    // Provide user-friendly error messages
    if (error.code === 'ERR_NETWORK') {
      error.userMessage = 'Network error: Please check your internet connection';
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timeout: The server took too long to respond';
    } else if (error.response?.status === 404) {
      error.userMessage = 'Service not found: The requested resource does not exist';
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Server error: Please try again later';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

