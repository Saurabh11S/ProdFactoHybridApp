import axios from 'axios';
import { getAPIBaseURL } from '../config/apiConfig';
import { getRecommendedTimeout } from '../config/renderPlanConfig';
import { Capacitor } from '@capacitor/core';
<<<<<<< HEAD
import { logger } from './logger';
=======
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9

// Get API URL dynamically to ensure it's correct for the current platform
const getBaseURL = (): string => {
  // Always get fresh URL to handle mobile detection correctly
  const url = getAPIBaseURL();
<<<<<<< HEAD
  logger.log('🔧 [Axios Config] Using API Base URL:', url);
=======
  console.log('🔧 [Axios Config] Using API Base URL:', url);
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
  return url;
};

// Create axios instance with proper configuration for mobile
// Note: baseURL will be set per-request to ensure correct URL
// Timeout is optimized based on Render.com plan (see renderPlanConfig.ts)
const axiosInstance = axios.create({
  baseURL: getBaseURL(), // Initial URL (will be updated if needed)
  timeout: getRecommendedTimeout(), // Optimized based on Render plan
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for logging and dynamic URL update
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure we're using the correct API URL (important for mobile)
    const currentApiUrl = getAPIBaseURL();
    if (config.baseURL !== currentApiUrl) {
<<<<<<< HEAD
      logger.log('🔄 [Axios] Updating baseURL from', config.baseURL, 'to', currentApiUrl);
=======
      console.log('🔄 [Axios] Updating baseURL from', config.baseURL, 'to', currentApiUrl);
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
      config.baseURL = currentApiUrl;
    }
    
    const isMobile = Capacitor.isNativePlatform() || 
                    (typeof window !== 'undefined' && 
                     (window.location.protocol === 'capacitor:' || 
                      window.location.protocol === 'file:'));
    
<<<<<<< HEAD
    logger.log('📤 ========== API REQUEST ==========');
    logger.log('📤 Method:', config.method?.toUpperCase());
    logger.log('📤 URL:', config.url);
    logger.log('📤 Base URL:', config.baseURL);
    logger.log('📤 Full URL:', `${config.baseURL}${config.url}`);
    logger.log('📱 Platform:', isMobile ? 'Mobile (Native)' : 'Web');
    logger.log('📱 Native Check:', Capacitor.isNativePlatform());
    logger.log('📤 Headers:', config.headers);
    logger.log('📤 Timeout:', config.timeout, 'ms');
    logger.log('📤 =================================');
=======
    console.log('📤 ========== API REQUEST ==========');
    console.log('📤 Method:', config.method?.toUpperCase());
    console.log('📤 URL:', config.url);
    console.log('📤 Base URL:', config.baseURL);
    console.log('📤 Full URL:', `${config.baseURL}${config.url}`);
    console.log('📱 Platform:', isMobile ? 'Mobile (Native)' : 'Web');
    console.log('📱 Native Check:', Capacitor.isNativePlatform());
    console.log('📤 Headers:', config.headers);
    console.log('📤 Timeout:', config.timeout, 'ms');
    console.log('📤 =================================');
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
    
    return config;
  },
  (error) => {
<<<<<<< HEAD
    logger.error('❌ Request Error:', error);
=======
    console.error('❌ Request Error:', error);
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
axiosInstance.interceptors.response.use(
  (response) => {
<<<<<<< HEAD
    logger.log('✅ API Response:', {
=======
    console.log('✅ API Response:', {
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const isNetworkError = error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    const fullURL = error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A';
    
<<<<<<< HEAD
    logger.error('❌ ========== API ERROR ==========');
    logger.error('❌ Message:', error.message);
    logger.error('❌ Code:', error.code);
    logger.error('❌ Status:', error.response?.status);
    logger.error('❌ Status Text:', error.response?.statusText);
    logger.error('❌ URL:', error.config?.url);
    logger.error('❌ Base URL:', error.config?.baseURL);
    logger.error('❌ Full URL:', fullURL);
    logger.error('❌ Response Data:', error.response?.data);
    logger.error('❌ Network Error:', isNetworkError);
    
    if (isNetworkError) {
      logger.error('❌ Network Issue Details:');
      logger.error('   - Check internet connection');
      logger.error('   - Backend may be starting (Render.com takes 30-60s)');
      logger.error('   - Verify backend URL is accessible');
      if (fullURL.includes('onrender.com')) {
        logger.error('   - Render.com service may be sleeping');
        logger.error('   - First request may take longer to wake up the service');
      }
    }
    logger.error('❌ =================================');
=======
    console.error('❌ ========== API ERROR ==========');
    console.error('❌ Message:', error.message);
    console.error('❌ Code:', error.code);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Status Text:', error.response?.statusText);
    console.error('❌ URL:', error.config?.url);
    console.error('❌ Base URL:', error.config?.baseURL);
    console.error('❌ Full URL:', fullURL);
    console.error('❌ Response Data:', error.response?.data);
    console.error('❌ Network Error:', isNetworkError);
    
    if (isNetworkError) {
      console.error('❌ Network Issue Details:');
      console.error('   - Check internet connection');
      console.error('   - Backend may be starting (Render.com takes 30-60s)');
      console.error('   - Verify backend URL is accessible');
      if (fullURL.includes('onrender.com')) {
        console.error('   - Render.com service may be sleeping');
        console.error('   - First request may take longer to wake up the service');
      }
    }
    console.error('❌ =================================');
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9

    // Provide user-friendly error messages
    if (error.code === 'ERR_NETWORK') {
      if (fullURL.includes('onrender.com')) {
        error.userMessage = 'Cannot connect to backend. The service may be starting up (can take 30-60 seconds). Please wait and try again.';
      } else {
        error.userMessage = 'Network error: Please check your internet connection';
      }
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timeout: The server took too long to respond. This may happen if the backend service is starting up.';
    } else if (error.response?.status === 404) {
      error.userMessage = 'Service not found: The requested resource does not exist';
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Server error: Please try again later';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

