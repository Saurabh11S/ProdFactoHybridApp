// Resolve API base URL from shared .env file
// FOR LOCAL DEVELOPMENT ONLY - Always uses localhost backend
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit environment variable from .env file
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Default to localhost for local development
  // No production detection - always use localhost when running locally
  return 'http://localhost:8080/api/v1';
};

export const BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 Admin API Base URL:', BASE_URL);
  console.log('📱 Platform:', window.location.hostname);
  console.log('💡 Tip: Set VITE_API_URL in Vercel environment variables to override this URL');
}
