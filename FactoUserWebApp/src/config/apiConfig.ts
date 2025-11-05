// Centralized API configuration
// Resolve API base URL from env with sensible defaults for dev/prod
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit environment variable
  const env = (import.meta as any).env;
  if (env && env.VITE_API_URL) {
    return env.VITE_API_URL;
  }
  
  // Use production backend URL
  return 'https://facto-backend-api.onrender.com/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

