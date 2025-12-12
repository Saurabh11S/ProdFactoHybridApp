import { Capacitor } from '@capacitor/core';

/**
 * Application configuration
 * Centralized configuration for app-wide settings
 */

// Production domain URL
const PRODUCTION_DOMAIN = 'https://facto.org.in';

/**
 * Get the base URL for sharing links
 * Returns production domain for mobile apps, current origin for web
 */
export const getShareBaseUrl = (): string => {
  // For mobile apps, always use production domain
  if (Capacitor.isNativePlatform()) {
    return PRODUCTION_DOMAIN;
  }
  
  // For web, use current origin (works for both dev and production)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback to production domain
  return PRODUCTION_DOMAIN;
};

