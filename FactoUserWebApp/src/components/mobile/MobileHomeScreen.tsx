import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ArrowRight } from 'lucide-react';
import { fetchServices, Service } from '../../api/services';
import { MobileServiceCard } from './MobileServiceCard';
import { useAuth } from '../../contexts/AuthContext';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface MobileHomeScreenProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

export function MobileHomeScreen({ onNavigate }: MobileHomeScreenProps) {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [_refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await fetchServices();
      const activeServices = data.filter(service => service.isActive !== false).slice(0, 6);
      setServices(activeServices);
    } catch (error) {
      console.error('Error loading services:', error);
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
            onClick={() => onNavigate('services')}
            className="flex-1 bg-[#007AFF] text-white py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-lg"
          >
            <span>File ITR Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('services')}
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

