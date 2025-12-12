import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ArrowRight } from 'lucide-react';
import { fetchServices, Service, fetchAllSubServices, SubService } from '../../api/services';
import { MobileServiceCard } from './MobileServiceCard';
import { AnimatedPromoBannerCarousel } from './AnimatedPromoBannerCarousel';
import { getActiveBanners } from '../../config/promoBanners';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../DarkModeContext';
import { needsWakeUp, getWakeUpWaitTime, getRetryDelays } from '../../config/renderPlanConfig';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface MobileHomeScreenProps {
  onNavigate: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
}

export function MobileHomeScreen({ onNavigate }: MobileHomeScreenProps) {
  const { isAuthenticated, token, user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [services, setServices] = useState<Service[]>([]);
  const [userServices, setUserServices] = useState<SubService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUserServices, setLoadingUserServices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_refreshing, setRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadServices();
  }, []);

  // Fetch user purchases when authenticated
  useEffect(() => {
    const fetchUserPurchases = async () => {
      if (!isAuthenticated || !token || !user) {
        setUserServices([]);
        return;
      }

      try {
        setLoadingUserServices(true);
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const purchasesRes = await axios.get(`${API_BASE_URL}/user-purchases`, { headers });
        const purchases = purchasesRes.data.data || [];

        // Filter service purchases
        const servicePurchases = purchases.filter((p: any) => p.itemType === 'service');
        
        if (servicePurchases.length > 0) {
          // Fetch all sub-services to map purchase IDs
          const allSubServices = await fetchAllSubServices();
          const purchasedServiceIds = servicePurchases.map((p: any) => p.itemId);
          const purchasedServices = allSubServices.filter((s: SubService) => 
            purchasedServiceIds.includes(s._id)
          );
          setUserServices(purchasedServices);
        } else {
          setUserServices([]);
        }
      } catch (error) {
        console.error('Error fetching user purchases:', error);
        setUserServices([]);
      } finally {
        setLoadingUserServices(false);
      }
    };

    fetchUserPurchases();
  }, [isAuthenticated, token, user]);

  // Wake up Render.com backend (only needed for free tier)
  const wakeUpBackend = async (): Promise<void> => {
    // Skip wake-up if using paid plan (always awake)
    if (!needsWakeUp()) {
      console.log('✅ [Wake-up] Using paid plan - service is always awake, skipping wake-up');
      return;
    }
    
    try {
      // IMPORTANT: Use getAPIBaseURL() function, not API_BASE_URL constant
      // This ensures we get the correct URL even if Capacitor initialized late
      const { getAPIBaseURL } = await import('../../config/apiConfig');
      const apiBaseUrl = getAPIBaseURL(); // Call function to get fresh URL
      
      // Use the health check endpoint at /api/v1/ (root of API)
      const healthCheckUrl = `${apiBaseUrl}/`;
      
      console.log('🏥 [Wake-up] Attempting to wake up Render.com backend (Free Tier)');
      console.log('🏥 [Wake-up] API Base URL:', apiBaseUrl);
      console.log('🏥 [Wake-up] Health check URL:', healthCheckUrl);
      console.log('🏥 [Wake-up] This may take 30-60 seconds for Render.com free tier...');
      
      // Make a lightweight request to wake up the service
      // Use a short timeout - we just want to trigger the wake-up, not wait for response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await fetch(healthCheckUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        console.log('🏥 [Wake-up] Health check response status:', response.status);
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          console.log('🏥 [Wake-up] Backend is awake!', data);
        }
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        // Ignore errors - this is just to wake up the service
        // Render.com free tier will timeout on first request while waking up
        if (fetchError.name !== 'AbortError') {
          console.log('🏥 [Wake-up] Health check error (expected if service is sleeping):', fetchError.message);
          console.log('🏥 [Wake-up] This is normal - backend is waking up. Will retry in a moment...');
        } else {
          console.log('🏥 [Wake-up] Health check timed out (backend may be waking up)');
        }
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.log('🏥 [Wake-up] Health check setup failed:', error);
    }
  };

  const loadServices = async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Step 1: Wake up Render.com backend (only for free tier)
      if (retryAttempt === 0) {
        if (needsWakeUp()) {
          console.log('🏥 [Load Services] Step 1: Waking up backend (Free Tier)...');
          await wakeUpBackend();
          
          // Wait for backend to start (Render.com free tier can take 30-60 seconds)
          const waitTime = getWakeUpWaitTime();
          if (waitTime > 0) {
            console.log(`⏳ [Load Services] Waiting for backend to wake up (${waitTime/1000} seconds)...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } else {
          console.log('✅ [Load Services] Using paid plan - service is always awake, skipping wake-up');
        }
      } else {
        // For retries, use plan-specific delays
        const retryDelays = getRetryDelays();
        const waitTime = retryDelays[Math.min(retryAttempt - 1, retryDelays.length - 1)] || 5000;
        console.log(`⏳ [Load Services] Retry wait: ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      // Step 2: Fetch services
      console.log('📡 [Load Services] Step 2: Fetching services...');
      // Don't set error here - keep loading state true to show skeleton
      const data = await fetchServices();
      const activeServices = data.filter(service => service.isActive !== false).slice(0, 6);
      setServices(activeServices);
      setRetryCount(0); // Reset retry count on success
      setError(null); // Clear any errors on success
      setLoading(false); // Set loading to false on success
      console.log('✅ [Load Services] Successfully loaded', activeServices.length, 'services');
    } catch (error: any) {
      console.error('❌ [Load Services] Error loading services:', error);
      console.error('❌ [Load Services] Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.status,
        url: error?.config?.url || error?.config?.baseURL
      });
      
      // Check if it's a network error and we should retry
      const isNetworkError = 
        error?.code === 'ERR_NETWORK' || 
        error?.code === 'ECONNABORTED' || 
        error?.message?.includes('Network') ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('Backend service is unavailable') ||
        error?.message?.includes('Failed to fetch') ||
        !error?.response; // No response usually means network issue
      
      // Retry up to 3 more times (total 4 attempts)
      // Render.com free tier can take up to 60 seconds to wake up
      if (isNetworkError && retryAttempt < 3) {
        const totalAttempts = retryAttempt + 2; // +2 because retryAttempt is 0-indexed and we already tried once
        console.log(`🔄 [Load Services] Network error detected. Retrying (attempt ${totalAttempts}/4)...`);
        
        // Progressive backoff: 10s, 15s, 20s
        const waitTime = retryAttempt === 0 ? 10000 : retryAttempt === 1 ? 15000 : 20000;
        // Don't set error here - keep loading state true to show skeleton during retry
        // The loading skeleton will be shown while we wait
        
        setTimeout(() => {
          loadServices(retryAttempt + 1);
        }, waitTime);
        return; // Don't set loading to false yet - we're retrying
      }
      
      // Only set error if we've exhausted all retries
      // Set user-friendly error message
      let errorMessage = 'Failed to load services. ';
      if (isNetworkError) {
        errorMessage += 'Cannot connect to backend server. ';
        errorMessage += 'Possible causes:\n';
        errorMessage += '• Backend service is starting (Render.com free tier takes 30-60s)\n';
        errorMessage += '• No internet connection\n';
        errorMessage += '• Backend service is down\n\n';
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error?.response?.status === 503) {
        errorMessage += 'Backend service is temporarily unavailable. Please try again in a few moments.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setError(errorMessage);
      setServices([]);
      setRetryCount(retryAttempt);
      setLoading(false); // Set loading to false only when we give up (no more retries)
    } finally {
      // Note: On success, loading is set to false in the try block.
      // On retry, we return early so loading stays true.
      // On final error, loading is set to false in the catch block.
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler (ready for future implementation)
  // const handleRefresh = () => {
  //   setRefreshing(true);
  //   loadServices();
  // };

  return (
    <div className={`min-h-screen pb-24 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-white'
    }`} style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Simplified Background Elements - No Color Shifts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static Subtle Gradient Background - No Animation */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-[#F9FAFB] via-white to-[#F0F9FF]'
        }`}></div>
        
        {/* Subtle Static Orbs - Reduced Opacity */}
        <div className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl ${
          isDarkMode 
            ? 'bg-[#007AFF]/5' 
            : 'bg-[#007AFF]/5'
        }`}></div>
        <div className={`absolute top-1/3 right-1/4 w-48 h-48 rounded-full blur-3xl ${
          isDarkMode 
            ? 'bg-[#00C897]/5' 
            : 'bg-[#00C897]/5'
        }`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full blur-3xl ${
          isDarkMode 
            ? 'bg-[#FFD166]/5' 
            : 'bg-[#FFD166]/5'
        }`}></div>
      </div>
      

      {/* Pull to Refresh Indicator */}
      {_refreshing && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#007AFF]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Header Section - Respects safe area, content starts below status bar */}
      {/* Background extends behind navigation bar, but content has proper safe area padding */}
      <div className={`relative px-4 pb-8 rounded-b-3xl animate-in z-[1] ${
        isDarkMode 
          ? 'bg-gradient-to-b from-[#0a1628] via-[#0f1b2e] to-[#152238] text-white' 
          : 'bg-gradient-to-b from-[#007AFF] via-[#0056CC] to-[#004299] text-white'
      }`} style={{
        // Only extend background behind navigation bar (4rem), NOT behind status bar
        // This ensures the background goes behind the transparent nav bar but content stays below status bar
        marginTop: `-4rem`,
        // Content padding: navigation bar (4rem) + safe area + content spacing (1.5rem)
        // This matches the wrapper's padding-top calculation to ensure content starts below status bar
        paddingTop: Capacitor.isNativePlatform()
          ? `calc(4rem + max(env(safe-area-inset-top, 40px), 40px) + 1.5rem)`
          : `calc(4rem + 1.5rem)`
      }}>
        {/* Trust Indicator Banner */}
        <div className="flex justify-center mb-6">
          <div className={`px-4 py-1.5 rounded-full border ${
            isDarkMode 
              ? 'bg-[#0a1628] border-[#1a2a3a]' 
              : 'bg-white/20 border-white/30'
          }`}>
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-[#60A5FA]' : 'text-white'
            }`}>Trusted by 50.000+ Indians</p>
          </div>
        </div>

        {/* Main Headline */}
        <div className="mb-4">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
            <span className="text-white">Get Your</span>
            <br />
            <span className="text-[#60A5FA]">Taxes & Finances</span>
            <br />
            <span className="text-white">Sorted with Facto</span>
          </h1>
          <p className="text-sm text-white/90 mt-3 leading-relaxed">
            Professional tax filing, GST services, and business registration made simple.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex gap-3 mt-6 mb-6">
          <button
            onClick={() => onNavigate('services', undefined, undefined, 'itr')}
            className="flex-1 bg-white text-[#007AFF] py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-lg"
          >
            <span>File ITR Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('services', undefined, undefined, 'gst')}
            className="flex-1 bg-black/40 backdrop-blur-sm border border-white/20 text-white py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-lg"
          >
            <span>Start GST Filing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Statistics Section */}
        <div className={`flex items-center justify-between mt-6 pt-6 border-t ${
          isDarkMode ? 'border-white/10' : 'border-white/20'
        }`}>
          {/* Success Rate */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="text-xl font-bold text-white">99%</div>
              <div className="text-xs text-white/70">Success Rate</div>
            </div>
          </div>

          {/* Tax Saved */}
          <div className="flex items-center gap-2">
            <span className="text-2xl text-yellow-400">₹</span>
            <div>
              <div className="text-xl font-bold text-white">₹4,5 Cr</div>
              <div className="text-xs text-white/70">Tax Saved</div>
            </div>
          </div>

          {/* Customers */}
          <div className="flex items-center gap-2">
            <span className="text-2xl text-[#60A5FA]">👥</span>
            <div>
              <div className="text-xl font-bold text-white">0.700+</div>
              <div className="text-xs text-white/70">Customers</div>
            </div>
          </div>
        </div>
      </div>


      {/* Promotional Banner - Single Static Banner */}
      {getActiveBanners().length > 0 && (
        <div className="relative z-20 -mt-4 mb-4">
          <AnimatedPromoBannerCarousel
            banners={getActiveBanners()}
            onCTAClick={onNavigate}
          />
        </div>
      )}

      {/* My Services Section (if authenticated) */}
      {isAuthenticated && (
        <div className="px-4 mb-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Services</h2>
            <button
              onClick={() => onNavigate('profile')}
              className="text-sm text-[#007AFF] font-medium"
            >
              View All
            </button>
          </div>
          {loadingUserServices ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ) : userServices.length > 0 ? (
            <div className="space-y-3">
              {userServices.slice(0, 3).map((service) => (
                <div
                  key={service._id}
                  onClick={() => onNavigate('service-details', service._id)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-98 transition-transform cursor-pointer"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                No active services yet. Start by exploring our services!
              </p>
              <button
                onClick={() => onNavigate('services')}
                className="w-full bg-[#007AFF] text-white py-3 rounded-xl font-medium mt-2 active:scale-98 transition-transform"
              >
                Explore Services
              </button>
            </div>
          )}
        </div>
      )}

      {/* All Services Section */}
      <div className="px-4 mb-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Our Services</h2>
          <button
            onClick={() => onNavigate('services')}
            className="text-sm text-[#007AFF] font-medium"
          >
            See All
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-red-200 dark:border-red-800">
            <div className="mb-4">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">Unable to Load Services</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            </div>
            <button
              onClick={() => loadServices(0)}
              className="bg-[#007AFF] text-white px-6 py-3 rounded-xl font-medium active:scale-98 transition-transform"
            >
              Retry
            </button>
            {retryCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Retried {retryCount} time{retryCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No services available at the moment.</p>
            <button
              onClick={() => onNavigate('services')}
              className="text-[#007AFF] font-medium"
            >
              View All Services →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => {
              return (
                <MobileServiceCard
                  key={service._id}
                  service={service}
                  onClick={(categoryFilter) => {
                    // Always navigate to services page with category filter if available
                    // Otherwise navigate to services page without filter
                    onNavigate('services', undefined, undefined, categoryFilter);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button for Quick ITR */}
      {Capacitor.isNativePlatform() && (
        <button
          onClick={() => onNavigate('services')}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-[#007AFF] to-[#0056CC] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl active:scale-95 transition-transform z-40 touch-manipulation"
          aria-label="File ITR Now"
        >
          📊
        </button>
      )}
    </div>
  );
}

