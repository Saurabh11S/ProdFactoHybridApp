import { Capacitor } from '@capacitor/core';

// Centralized API configuration
// Uses shared .env file from root directory
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit environment variable from .env file
  const env = (import.meta as any).env;
  if (env && env.VITE_API_URL) {
    return env.VITE_API_URL;
  }
  
  // Priority 2: Check if we're in production (Vercel deployment)
  // In production, use production backend; in development, use localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If deployed on Vercel or production domain, use production backend
    if (hostname.includes('vercel.app') || hostname.includes('facto') || hostname !== 'localhost') {
      return 'https://facto-backend-api.onrender.com/api/v1';
    }
  }
  
  // Priority 3: Default to localhost for local development
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('📱 Platform:', Capacitor.isNativePlatform() ? 'Mobile' : 'Web');
  console.log('💡 Tip: Set VITE_API_URL in .env file to override this URL');
}

