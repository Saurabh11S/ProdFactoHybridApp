import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ArrowRight } from 'lucide-react';
import { fetchServices, Service } from '../../api/services';
import { MobileServiceCard } from './MobileServiceCard';
import { useAuth } from '../../contexts/AuthContext';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface MobileHomeScreenProps {
  onNavigate: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
}

export function MobileHomeScreen({ onNavigate }: MobileHomeScreenProps) {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_refreshing, setRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchServices();
      const activeServices = data.filter(service => service.isActive !== false).slice(0, 6);
      setServices(activeServices);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('Error loading services:', error);
      
      // Check if it's a network error and we should retry
      const isNetworkError = error?.code === 'ERR_NETWORK' || 
                            error?.code === 'ECONNABORTED' || 
                            error?.message?.includes('Network') ||
                            error?.message?.includes('timeout');
      
      // Retry up to 2 times for network errors (total 3 attempts)
      if (isNetworkError && retryAttempt < 2) {
        console.log(`Retrying service fetch (attempt ${retryAttempt + 1}/2)...`);
        setTimeout(() => {
          loadServices(retryAttempt + 1);
        }, 2000 * (retryAttempt + 1)); // Exponential backoff: 2s, 4s
        return;
      }
      
      // Set user-friendly error message
      let errorMessage = 'Failed to load services. ';
      if (isNetworkError) {
        errorMessage += 'Please check your internet connection or the backend service may be starting up.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setError(errorMessage);
      setServices([]);
      setRetryCount(retryAttempt);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler (ready for future implementation)
  // const handleRefresh = () => {
  //   setRefreshing(true);
  //   loadServices();
  // };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Pull to Refresh Indicator */}
      {_refreshing && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#007AFF]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-b from-[#0a1628] via-[#0f1b2e] to-[#152238] text-white px-4 pt-20 pb-8 rounded-b-3xl animate-in">
        {/* Trust Indicator Banner */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#0a1628] px-4 py-1.5 rounded-full border border-[#1a2a3a]">
            <p className="text-sm text-[#60A5FA] font-medium">Trusted by 50.000+ Indians</p>
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
            className="flex-1 bg-[#007AFF] text-white py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-lg"
          >
            <span>File ITR Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('services', undefined, undefined, 'gst')}
            className="flex-1 bg-transparent border-2 border-white text-white py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform"
          >
            <span>Start GST Filing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Statistics Section */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
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

      {/* My Services Section (if authenticated) */}
      {isAuthenticated && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Services</h2>
            <button
              onClick={() => onNavigate('profile')}
              className="text-sm text-[#007AFF] font-medium"
            >
              View All
            </button>
          </div>
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
        </div>
      )}

      {/* All Services Section */}
      <div className="px-4 mb-6">
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
            {services.map((service) => (
              <MobileServiceCard
                key={service._id}
                service={service}
                onClick={() => onNavigate('service-details', service._id)}
              />
            ))}
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

