import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { fetchAllSubServices, SubService } from '../api/services';
import { API_BASE_URL } from '../config/apiConfig';

type PageType = 'home' | 'services' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

interface UserPurchase {
  _id: string;
  userId: string;
  itemType: 'service' | 'course';
  itemId: string;
  selectedFeatures: string[];
  billingPeriod: string;
  paymentOrderId: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface ServicesPageProps {
  onNavigate: (page: PageType, serviceId?: string) => void;
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const { isAuthenticated, user, token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [services, setServices] = useState<SubService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        setError(null);
        console.log('Fetching services in ServicesPage...');
        const data = await fetchAllSubServices();
        console.log('Fetched services data:', data);
        const activeServices = data.filter(service => service.isActive);
        console.log('Active services:', activeServices);
        setServices(activeServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch user purchases when component mounts
  useEffect(() => {
    const fetchUserPurchases = async () => {
      // Only fetch if user is authenticated and has a token
      if (!isAuthenticated || !user || !token) {
        console.log('Skipping user purchases fetch - user not authenticated');
        return;
      }
      
      setLoading(true);
      try {
        console.log('Fetching user purchases for authenticated user');
        const response = await axios.get(`${API_BASE_URL}/user-purchases`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserPurchases(response.data.data || []);
        console.log('User purchases fetched successfully');
      } catch (error) {
        console.error('Error fetching user purchases:', error);
        // Don't show error to user if they're not authenticated
        if ((error as any)?.response?.status !== 401) {
          console.error('Non-auth error fetching user purchases:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPurchases();
  }, [isAuthenticated, user, token]);

  // Helper function to check if a service is already purchased
  const isServicePurchased = (serviceId: string): boolean => {
    return userPurchases.some(purchase => 
      purchase.itemId === serviceId && 
      purchase.itemType === 'service' && 
      purchase.status === 'active'
    );
  };

  // Generate categories dynamically from services
  const categories = [
    { id: 'all', name: 'All Services', count: services.length },
    ...Array.from(new Set(services.map(service => service.serviceId.category)))
      .map(category => ({
        id: category.toLowerCase(),
        name: category,
        count: services.filter(service => service.serviceId.category === category).length
      }))
  ];

  // Filter services based on selected category
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.serviceId.category.toLowerCase() === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1F2937] dark:text-white mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Professional Services</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive financial and business services designed for individuals and small businesses across India.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-[#007AFF] text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-[#007AFF] hover:text-[#007AFF]'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {servicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse"
              >
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-red-500 text-lg mb-4">
                <p className="font-semibold mb-2">⚠️ Unable to load services</p>
                <p className="text-sm">{error}</p>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0056CC] transition-colors"
                >
                  Try Again
                </button>
                <p className="text-xs text-gray-500">
                  If the problem persists, please check if services are available in the admin panel.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${
                  isServicePurchased(service._id)
                    ? 'border-green-200 dark:border-green-700 hover:shadow-green-100 dark:hover:shadow-green-900/20'
                    : 'border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2'
                }`}
              >
                {/* Service Header */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-[#1F2937] dark:text-white text-lg group-hover:text-[#007AFF] transition-colors">
                          {service.title}
                        </h3>
                        {isServicePurchased(service._id) && (
                          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-bold">
                            Already Purchased
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-[#00C897] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Service Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.period}
                    </div>
                    <div className="flex items-center">
                      <span className="text-[#007AFF] font-bold">₹{service.price}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="relative">
                      <button
                        onClick={() => !isServicePurchased(service._id) && onNavigate('service-details', service._id)}
                        disabled={isServicePurchased(service._id)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
                          isServicePurchased(service._id)
                            ? 'border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                            : 'border border-[#007AFF] text-[#007AFF] dark:text-[#007AFF] hover:bg-[#007AFF] hover:text-white cursor-pointer'
                        }`}
                        title={isServicePurchased(service._id) ? 'This service is already purchased' : 'View service details'}
                      >
                        {isServicePurchased(service._id) ? 'Already Purchased' : 'View Details'}
                      </button>
                      {isServicePurchased(service._id) && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          Service already purchased
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      {isServicePurchased(service._id) ? (
                        <button
                          onClick={() => onNavigate('profile')}
                          className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer"
                          title="View your purchased service in profile"
                        >
                          View in Profile
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => isAuthenticated ? onNavigate('service-details', service._id) : onNavigate('login')}
                            disabled={!isAuthenticated}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
                              isAuthenticated 
                                ? 'bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white hover:shadow-lg cursor-pointer' 
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isAuthenticated ? 'Get Quotation' : 'Login to Get Quotation'}
                          </button>
                          {!isAuthenticated && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                              Please login to get quotation
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-[#007AFF]/10 to-[#00C897]/10 dark:from-[#007AFF]/20 dark:to-[#00C897]/20 rounded-2xl p-8 border border-[#007AFF]/20 dark:border-[#007AFF]/30">
          <h3 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Can't find exactly what you're looking for? Our experts can create a tailored solution for your specific business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => isAuthenticated ? window.open('tel:+91-9876543210', '_self') : onNavigate('login')}
              disabled={!isAuthenticated}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isAuthenticated 
                  ? 'bg-[#007AFF] text-white hover:bg-[#0056CC] cursor-pointer' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAuthenticated ? 'Schedule Consultation' : 'Login to Schedule Consultation'}
            </button>
            <button 
              onClick={() => isAuthenticated ? window.open('tel:+91-9876543210', '_self') : onNavigate('login')}
              disabled={!isAuthenticated}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                isAuthenticated 
                  ? 'border border-[#007AFF] text-[#007AFF] dark:text-[#007AFF] hover:bg-[#007AFF] hover:text-white cursor-pointer' 
                  : 'border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAuthenticated ? 'Contact Expert' : 'Login to Contact Expert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
