import { Capacitor } from '@capacitor/core';

// Centralized API configuration
// Uses shared .env file from root directory
// FOR LOCAL DEVELOPMENT ONLY - Always uses localhost backend
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit environment variable from .env file
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Default to localhost for local development
  // No production detection - always use localhost when running locally
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('📱 Platform:', Capacitor.isNativePlatform() ? 'Mobile' : 'Web');
  console.log('💡 Tip: Set VITE_API_URL in .env file to override this URL');
}

