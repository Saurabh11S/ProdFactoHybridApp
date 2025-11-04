// Centralized API configuration
// Resolve API base URL from env with sensible defaults for dev/prod
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit environment variable
  const env = (import.meta as any).env;
  if (env && env.VITE_API_URL) {
    return env.VITE_API_URL;
  }
  
  // Priority 2: Check if we're in production (not localhost)
  const isProduction = 
    typeof window !== 'undefined' && 
    (window.location.hostname !== 'localhost' && 
     window.location.hostname !== '127.0.0.1' &&
     !window.location.hostname.includes('localhost'));
  
  // Priority 3: Vite's PROD mode (set during build)
  const isViteProd = env && env.PROD;
  
  if (isProduction || isViteProd) {
    return 'https://facto-backend-api.onrender.com/api/v1'; // Production backend URL
  }
  
  // Default: Development
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

