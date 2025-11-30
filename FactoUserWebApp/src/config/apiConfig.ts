import { Capacitor } from '@capacitor/core';
<<<<<<< HEAD
import { logger } from '../utils/logger';
=======
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9

// Centralized API configuration
// Automatically detects environment (localhost vs production)
// IMPORTANT: For mobile apps, we always use production backend
// This prevents caching issues where Capacitor might not be initialized at module load time

const PRODUCTION_API_URL = 'https://facto-backend-api.onrender.com/api/v1';
const LOCAL_API_URL = 'http://localhost:8080/api/v1';

// Function to get API URL - called dynamically to ensure Capacitor is initialized
const getApiBaseUrl = (): string => {
  // CRITICAL: For mobile apps, ALWAYS use production backend
  // Check mobile FIRST, before checking environment variables
  // This ensures mobile apps never use localhost even if VITE_API_URL is set
  
  // Priority 1: Check if running on native platform (most reliable check)
  try {
    const isNative = Capacitor.isNativePlatform();
<<<<<<< HEAD
    logger.log('🔍 [API Config] Capacitor.isNativePlatform():', isNative);
    
    if (isNative) {
      logger.log('📱 [API Config] Detected native platform - FORCING production API (ignoring VITE_API_URL)');
      logger.log('📱 [API Config] Production API URL:', PRODUCTION_API_URL);
=======
    console.log('🔍 [API Config] Capacitor.isNativePlatform():', isNative);
    
    if (isNative) {
      console.log('📱 [API Config] Detected native platform - FORCING production API (ignoring VITE_API_URL)');
      console.log('📱 [API Config] Production API URL:', PRODUCTION_API_URL);
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
      return PRODUCTION_API_URL;
    }
  } catch (e) {
    // Capacitor might not be initialized yet, but we'll check other ways
<<<<<<< HEAD
    logger.warn('⚠️ [API Config] Capacitor check failed, trying alternative detection:', e);
=======
    console.warn('⚠️ [API Config] Capacitor check failed, trying alternative detection:', e);
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
  }
  
  // Priority 2: Check window location for mobile indicators
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const userAgent = navigator.userAgent;
    
<<<<<<< HEAD
    logger.log('🔍 [API Config] Window check - protocol:', protocol, 'hostname:', hostname);
    logger.log('🔍 [API Config] User agent includes Capacitor:', userAgent.includes('Capacitor'));
=======
    console.log('🔍 [API Config] Window check - protocol:', protocol, 'hostname:', hostname);
    console.log('🔍 [API Config] User agent includes Capacitor:', userAgent.includes('Capacitor'));
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
    
    // Check for Capacitor protocol or file protocol (mobile app indicators)
    if (protocol === 'capacitor:' || protocol === 'file:' || hostname === 'localhost') {
      // Additional check: if user agent includes Capacitor
      if (userAgent.includes('Capacitor')) {
<<<<<<< HEAD
        logger.log('📱 [API Config] Detected mobile via protocol/userAgent - FORCING production API (ignoring VITE_API_URL)');
        logger.log('📱 [API Config] Production API URL:', PRODUCTION_API_URL);
=======
        console.log('📱 [API Config] Detected mobile via protocol/userAgent - FORCING production API (ignoring VITE_API_URL)');
        console.log('📱 [API Config] Production API URL:', PRODUCTION_API_URL);
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
        return PRODUCTION_API_URL;
      }
    }
    
    // Priority 3: Detect if running on Vercel (production web)
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com') || hostname.includes('facto.org.in')) {
<<<<<<< HEAD
      logger.log('🌐 [API Config] Detected Vercel - using production API:', PRODUCTION_API_URL);
=======
      console.log('🌐 [API Config] Detected Vercel - using production API:', PRODUCTION_API_URL);
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
      return PRODUCTION_API_URL;
    }
  }
  
  // Priority 4: Explicit environment variable (from Vercel or .env file)
  // Only use this for WEB apps, not mobile (mobile was already handled above)
  if (import.meta.env.VITE_API_URL) {
<<<<<<< HEAD
    logger.log('🌐 [API Config] Using VITE_API_URL (web only):', import.meta.env.VITE_API_URL);
=======
    console.log('🌐 [API Config] Using VITE_API_URL (web only):', import.meta.env.VITE_API_URL);
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 5: Default to localhost for local development (web only)
<<<<<<< HEAD
  logger.log('🌐 [API Config] Using default localhost API:', LOCAL_API_URL);
=======
  console.log('🌐 [API Config] Using default localhost API:', LOCAL_API_URL);
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
  return LOCAL_API_URL;
};

// Export as a function to ensure it's called dynamically
// This prevents caching issues where the URL might be determined before Capacitor is ready
export const getAPIBaseURL = (): string => {
  return getApiBaseUrl();
};

// For backward compatibility, export API_BASE_URL
// CRITICAL: This is computed at module load, which may be BEFORE Capacitor initializes
// Always use getAPIBaseURL() function instead for mobile apps to get fresh value
// This constant is kept for backward compatibility with existing code
export const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
// Use setTimeout to ensure Capacitor is initialized
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const isNative = Capacitor.isNativePlatform();
    const apiUrl = getApiBaseUrl();
    
<<<<<<< HEAD
    logger.log('🌐 ========== API CONFIGURATION ==========');
    logger.log('🌐 API Base URL:', apiUrl);
    logger.log('📱 Platform:', isNative ? 'Mobile (Native)' : 'Web');
    logger.log('🌍 Environment:', isNative ? 'Production (Mobile)' : (window.location.hostname.includes('vercel') || window.location.hostname.includes('facto.org.in')) ? 'Production (Web)' : 'Development');
    logger.log('🔍 Native Platform Check:', isNative);
    logger.log('🔍 Hostname:', window.location.hostname);
    logger.log('🔍 User Agent:', navigator.userAgent);
    logger.log('🌐 =======================================');
    
    // Additional check for mobile - ensure we're using production URL
    if (isNative && !apiUrl.includes('onrender.com')) {
      logger.warn('⚠️ WARNING: Mobile app is not using production backend!');
      logger.warn('⚠️ Current URL:', apiUrl);
      logger.warn('⚠️ Expected: https://facto-backend-api.onrender.com/api/v1');
=======
    console.log('🌐 ========== API CONFIGURATION ==========');
    console.log('🌐 API Base URL:', apiUrl);
    console.log('📱 Platform:', isNative ? 'Mobile (Native)' : 'Web');
    console.log('🌍 Environment:', isNative ? 'Production (Mobile)' : (window.location.hostname.includes('vercel') || window.location.hostname.includes('facto.org.in')) ? 'Production (Web)' : 'Development');
    console.log('🔍 Native Platform Check:', isNative);
    console.log('🔍 Hostname:', window.location.hostname);
    console.log('🔍 User Agent:', navigator.userAgent);
    console.log('🌐 =======================================');
    
    // Additional check for mobile - ensure we're using production URL
    if (isNative && !apiUrl.includes('onrender.com')) {
      console.warn('⚠️ WARNING: Mobile app is not using production backend!');
      console.warn('⚠️ Current URL:', apiUrl);
      console.warn('⚠️ Expected: https://facto-backend-api.onrender.com/api/v1');
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
    }
  }, 100);
} else {
  // For native platforms, log immediately
  const isNative = Capacitor.isNativePlatform();
  const apiUrl = getApiBaseUrl();
<<<<<<< HEAD
  logger.log('🌐 ========== API CONFIGURATION ==========');
  logger.log('🌐 API Base URL:', apiUrl);
  logger.log('📱 Platform: Mobile (Native)');
  logger.log('🌍 Environment: Production');
  logger.log('🔍 Native Platform Check:', isNative);
  logger.log('🌐 =======================================');
  
  if (isNative && !apiUrl.includes('onrender.com')) {
    logger.warn('⚠️ WARNING: Mobile app is not using production backend!');
    logger.warn('⚠️ Current URL:', apiUrl);
    logger.warn('⚠️ Expected: https://facto-backend-api.onrender.com/api/v1');
=======
  console.log('🌐 ========== API CONFIGURATION ==========');
  console.log('🌐 API Base URL:', apiUrl);
  console.log('📱 Platform: Mobile (Native)');
  console.log('🌍 Environment: Production');
  console.log('🔍 Native Platform Check:', isNative);
  console.log('🌐 =======================================');
  
  if (isNative && !apiUrl.includes('onrender.com')) {
    console.warn('⚠️ WARNING: Mobile app is not using production backend!');
    console.warn('⚠️ Current URL:', apiUrl);
    console.warn('⚠️ Expected: https://facto-backend-api.onrender.com/api/v1');
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
  }
}

