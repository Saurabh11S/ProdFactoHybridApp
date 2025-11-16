import { Capacitor } from '@capacitor/core';

// Centralized API configuration
// Automatically detects environment (localhost vs production)
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit environment variable (from Vercel or .env file)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Use production backend for mobile apps
  if (Capacitor.isNativePlatform()) {
    return 'https://facto-backend-api.onrender.com/api/v1';
  }
  
  // Priority 3: Detect if running on Vercel (production web)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com') || hostname.includes('facto.org.in')) {
      return 'https://facto-backend-api.onrender.com/api/v1';
    }
  }
  
  // Priority 4: Default to localhost for local development
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('📱 Platform:', Capacitor.isNativePlatform() ? 'Mobile (Native)' : 'Web');
  console.log('🌍 Environment:', Capacitor.isNativePlatform() || window.location.hostname.includes('vercel') || window.location.hostname.includes('facto.org.in') ? 'Production' : 'Development');
  console.log('🔍 Native Platform Check:', Capacitor.isNativePlatform());
  console.log('🔍 Hostname:', window.location.hostname);
} else {
  // For native platforms, log immediately
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('📱 Platform: Mobile (Native)');
  console.log('🌍 Environment: Production');
  console.log('🔍 Native Platform Check: true (server-side)');
}

// Additional check for mobile - ensure we're using production URL
if (Capacitor.isNativePlatform() && !API_BASE_URL.includes('onrender.com')) {
  console.warn('⚠️ WARNING: Mobile app is not using production backend!');
  console.warn('⚠️ Current URL:', API_BASE_URL);
  console.warn('⚠️ Expected: https://facto-backend-api.onrender.com/api/v1');
}

