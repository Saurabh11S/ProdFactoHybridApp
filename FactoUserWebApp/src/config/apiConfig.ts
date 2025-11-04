// Centralized API configuration
// Resolve API base URL from env with sensible defaults for dev/prod
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD)
      ? 'https://facto-backend-api.onrender.com/api/v1' // Production backend URL
      : 'http://localhost:8080/api/v1'; // Development default

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

