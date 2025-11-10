// Resolve API base URL from shared .env file
// Uses localhost backend for local development
export const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:8080/api/v1'; // Default to localhost for local development

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 Admin API Base URL:', BASE_URL);
}
