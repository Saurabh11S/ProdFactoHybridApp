import { useState, useEffect, useRef } from 'react';
import { fetchServices, Service } from '../api/services';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface ServicesSectionProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

// Helper function to get service icon based on title
const getServiceIcon = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('itr') || titleLower.includes('income tax')) return '📊';
  if (titleLower.includes('gst')) return '🏢';
  if (titleLower.includes('investment')) return '📈';
  if (titleLower.includes('tax') || titleLower.includes('consultancy')) return '💡';
  if (titleLower.includes('notice') || titleLower.includes('scrutiny')) return '📋';
  if (titleLower.includes('registration')) return '🏆';
  if (titleLower.includes('outsourcing')) return '💼';
  return '📄';
};

// Helper function to get service color scheme based on title
const getServiceColorScheme = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('itr') || titleLower.includes('income tax')) {
    return {
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-700',
    };
  }
  if (titleLower.includes('gst')) {
    return {
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-700',
    };
  }
  if (titleLower.includes('investment')) {
    return {
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-700',
    };
  }
  if (titleLower.includes('tax') || titleLower.includes('consultancy')) {
    return {
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-700',
    };
  }
  if (titleLower.includes('notice') || titleLower.includes('scrutiny')) {
    return {
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      textColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-700',
    };
  }
  if (titleLower.includes('registration')) {
    return {
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      borderColor: 'border-indigo-200 dark:border-indigo-700',
    };
  }
  // Default color scheme
  return {
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-900/30',
    textColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-200 dark:border-teal-700',
  };
};

export function ServicesSection({ onNavigate }: ServicesSectionProps) {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch main service categories from database
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Loading services for Professional Services Section...');
        const data = await fetchServices();
        console.log('✅ Fetched services data:', data);
        console.log('📊 Total services received:', data.length);
        
        // Backend now filters by isActive, but double-check on frontend
        const activeServices = data.filter(service => service.isActive !== false);
        console.log('✅ Active services after filter:', activeServices.length);
        console.log('📋 Active services list:', activeServices.map(s => ({ 
          _id: s._id,
          title: s.title, 
          category: s.category, 
          isActive: s.isActive,
          hasDescription: !!s.description,
          featuresCount: s.features?.length || 0
        })));
        
        // Sort by title alphabetically for consistent display
        activeServices.sort((a, b) => a.title.localeCompare(b.title));
        setServices(activeServices);
        
        if (activeServices.length === 0) {
          console.warn('⚠️ No active services found in database');
          console.warn('⚠️ Raw data received:', data);
          if (data.length === 0) {
            setError('No services found in database. Please add services from Admin App.');
          } else {
            setError(`Found ${data.length} service(s), but none are active. Please activate services in Admin App.`);
          }
        }
      } catch (err: any) {
        console.error('❌ Error fetching services:', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load services';
        console.error('Error details:', {
          message: errorMessage,
          status: err?.response?.status,
          url: err?.config?.url
        });
        setError(`Failed to load services: ${errorMessage}. Please check your API connection.`);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);


  useEffect(() => {
    // Only set up observer if services exist
    if (services.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => [...new Set([...prev, cardIndex])]);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const cards = sectionRef.current?.querySelectorAll('[data-index]');
      if (cards && cards.length > 0) {
        cards.forEach(card => observer.observe(card));
        // Immediately show all cards if they're already in viewport
        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            setVisibleCards(prev => [...new Set([...prev, index])]);
          }
        });
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [services.length]);

  // Debug: Log component render
  useEffect(() => {
    console.log('🎨 ServicesSection component rendered');
    console.log('📊 Current state:', { 
      loading, 
      error, 
      servicesCount: services.length,
      visibleCardsCount: visibleCards.length 
    });
  }, [loading, error, services.length, visibleCards.length]);

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden" id="services">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#007AFF]/10 to-[#00C897]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#FFD166]/10 to-[#007AFF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-full text-sm font-medium text-[#007AFF] dark:text-blue-400 mb-4 backdrop-blur-lg border border-[#007AFF]/20 dark:border-blue-400/20">
            Our Services
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Financial Services</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-200 max-w-3xl mx-auto">
            From tax filing to business registration, we provide comprehensive financial solutions 
            tailored for Indian individuals and small businesses.
          </p>
        </div>

        {/* Debug Info - Remove after fixing */}
        {import.meta.env.DEV && (
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 rounded-lg text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
            <p>Services Count: {services.length}</p>
            <p>API URL: {import.meta.env.VITE_API_URL || 'Using default'}</p>
          </div>
        )}

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse"
              >
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">Error Loading Services</h3>
              <p className="text-red-600 dark:text-red-300 text-sm mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => {
                    console.log('🔍 Debug Info:', {
                      API_URL: import.meta.env.VITE_API_URL || 'Not set (using default)',
                      services: services.length,
                      loading,
                      error
                    });
                  }}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Debug Info
                </button>
              </div>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Services Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'No active services found in the database.'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Please add services from the Admin App to display them here.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const colorScheme = getServiceColorScheme(service.title);
              const icon = getServiceIcon(service.title);
              return (
                <div
                  key={service._id}
                  data-index={index}
                  className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-[#007AFF]/30 dark:hover:border-blue-400/30 shadow-lg hover:shadow-2xl transition-all duration-700 transform ${
                    visibleCards.includes(index) || visibleCards.length === 0
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-10 opacity-0'
                  } hover:-translate-y-4 hover:scale-105`}
                  style={{ 
                    transitionDelay: (visibleCards.includes(index) || visibleCards.length === 0) ? `${index * 150}ms` : '0ms' 
                  }}
                >
                  {/* Glassmorphism overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  {/* Service Icon */}
                  <div className={`relative w-16 h-16 ${colorScheme.bgColor} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-all duration-300 border ${colorScheme.borderColor} shadow-lg`}>
                    <span className="relative z-10">{icon}</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Service Content */}
                  <div className="relative space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors duration-300">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed line-clamp-3">
                      {service.description}
                    </p>

                    {/* Features List */}
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2">
                        {service.features.slice(0, 4).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-200 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${featureIndex * 50}ms` }}>
                            <div className={`w-4 h-4 ${colorScheme.textColor} mr-2 flex-shrink-0 transform scale-100 group-hover:scale-110 transition-transform duration-300`}>
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA Button */}
                    <button 
                      onClick={() => onNavigate('services', service._id)}
                      className={`relative w-full mt-6 bg-gradient-to-r ${colorScheme.color} text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 overflow-hidden group-hover:shadow-2xl hover:brightness-110`}
                    >
                      <span className="relative z-10">Explore Services</span>
                    </button>
                  </div>

                  {/* Floating particles on hover */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-[#007AFF] to-[#00C897] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-[#FFD166] to-[#FFA500] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-2xl p-8 border border-[#007AFF]/20 dark:border-blue-400/20 backdrop-blur-lg relative overflow-hidden">
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF]/5 via-[#00C897]/5 to-[#007AFF]/5 opacity-0 hover:opacity-100 transition-opacity duration-700 animate-gradient-x"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
              Need Help Choosing the Right Service?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Our expert team can guide you through our services and help you find the perfect solution for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => onNavigate('login')}
                className="group bg-[#007AFF] hover:bg-[#0056CC] text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Schedule Free Consultation
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
              <button 
                onClick={() => onNavigate('services')}
                className="group border border-[#007AFF] dark:border-blue-400 text-[#007AFF] dark:text-blue-400 hover:bg-[#007AFF] hover:text-white dark:hover:bg-blue-500 px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  View All Services
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 4s ease infinite;
        }
      `}</style>
    </section>
  );
}
