// Resolve API base URL from shared .env file
// Auto-detects production environment (Vercel) and uses production backend
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit environment variable from .env file or Vercel
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
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

export const BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 Admin API Base URL:', BASE_URL);
  console.log('📱 Platform:', window.location.hostname);
  console.log('💡 Tip: Set VITE_API_URL in Vercel environment variables to override this URL');
}
