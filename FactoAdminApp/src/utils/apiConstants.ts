// Resolve API base URL from env with sensible defaults for dev/prod
// Always use production backend URL (which uses MongoDB Atlas connection string)
// This ensures both localhost and production use the same database
export const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : 'https://facto-backend-api.onrender.com/api/v1'; // Production backend URL

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 Admin API Base URL:', BASE_URL);
}
