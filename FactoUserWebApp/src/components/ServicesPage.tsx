import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { fetchAllSubServices, fetchServices, SubService, Service } from '../api/services';
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
  onNavigate: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
  initialFilter?: string;
}

export function ServicesPage({ onNavigate, initialFilter }: ServicesPageProps) {
  const { isAuthenticated, user, token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(initialFilter || 'all');
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [services, setServices] = useState<SubService[]>([]);
  const [mainServices, setMainServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update selectedCategory when initialFilter changes
  useEffect(() => {
    if (initialFilter) {
      setSelectedCategory(initialFilter);
    }
  }, [initialFilter]);

  // Fetch both main services and sub-services when component mounts
  useEffect(() => {
    const loadServices = async () => {
      try {
        setServicesLoading(true);
        setError(null);
        console.log('🔄 [ServicesPage] Fetching services...');
        
        // Fetch both sub-services and main services in parallel
        const [subServicesData, mainServicesData] = await Promise.all([
          fetchAllSubServices().catch(err => {
            console.error('❌ [ServicesPage] Error fetching sub-services:', err);
            return [];
          }),
          fetchServices().catch(err => {
            console.error('❌ [ServicesPage] Error fetching main services:', err);
            return [];
          })
        ]);
        
        console.log('📊 [ServicesPage] Raw sub-services data length:', subServicesData.length);
        console.log('📊 [ServicesPage] Raw main services data length:', mainServicesData.length);
        
        // Log the actual data structure
        if (subServicesData.length > 0) {
          console.log('📊 [ServicesPage] First sub-service sample:', JSON.stringify(subServicesData[0], null, 2));
        }
        if (mainServicesData.length > 0) {
          console.log('📊 [ServicesPage] First main service sample:', JSON.stringify(mainServicesData[0], null, 2));
        }
        
        // Log ALL sub-services with their serviceId details
        console.log('📋 [ServicesPage] ALL fetched sub-services:', subServicesData.map(s => ({
          _id: s._id,
          title: s.title,
          isActive: s.isActive,
          serviceId: s.serviceId,
          serviceIdType: typeof s.serviceId,
          serviceIdCategory: typeof s.serviceId === 'object' && s.serviceId !== null 
            ? (s.serviceId as any).category 
            : 'N/A (not populated or string)',
          serviceIdTitle: typeof s.serviceId === 'object' && s.serviceId !== null 
            ? (s.serviceId as any).title 
            : 'N/A (not populated or string)'
        })));
        
        // Backend already filters by isActive, but double-check on frontend
        const activeSubServices = subServicesData.filter(service => service.isActive !== false);
        const activeMainServices = mainServicesData.filter(service => service.isActive !== false);
        
        console.log('✅ [ServicesPage] Active sub-services:', activeSubServices.length);
        console.log('✅ [ServicesPage] Active main services:', activeMainServices.length);
        
        // Log which sub-services have properly populated serviceId
        const subServicesWithPopulatedServiceId = activeSubServices.filter(s => 
          typeof s.serviceId === 'object' && s.serviceId !== null
        );
        const subServicesWithStringServiceId = activeSubServices.filter(s => 
          typeof s.serviceId === 'string'
        );
        const subServicesWithNullServiceId = activeSubServices.filter(s => 
          !s.serviceId || s.serviceId === null
        );
        
        console.log('📊 [ServicesPage] Sub-services breakdown:', {
          total: activeSubServices.length,
          withPopulatedServiceId: subServicesWithPopulatedServiceId.length,
          withStringServiceId: subServicesWithStringServiceId.length,
          withNullServiceId: subServicesWithNullServiceId.length
        });
        
        if (subServicesWithNullServiceId.length > 0) {
          console.warn('⚠️ [ServicesPage] Sub-services with null serviceId:', subServicesWithNullServiceId.map(s => s.title));
        }
        
        // Helper function to extract category from serviceId (needs mainServices)
        const getCategoryFromSubService = (sub: SubService): string => {
          // First try: serviceId is populated as object
          if (typeof sub.serviceId === 'object' && sub.serviceId !== null) {
            const category = (sub.serviceId as any).category || (sub.serviceId as any).title || 'Unknown';
            return category;
          }
          
          // Second try: serviceId is a string ID - lookup in mainServices
          if (typeof sub.serviceId === 'string') {
            const mainService = activeMainServices.find(s => s._id === sub.serviceId);
            if (mainService) {
              return mainService.category || mainService.title || 'Unknown';
            }
          }
          
          // Third try: Match by serviceCode pattern (fallback)
          if (sub.serviceCode) {
            const serviceCodeUpper = sub.serviceCode.toUpperCase();
            if (serviceCodeUpper.includes('GSTR') || serviceCodeUpper.includes('GST')) {
              return 'GST';
            }
            if (serviceCodeUpper.includes('ITR')) {
              return 'ITR';
            }
            if (serviceCodeUpper.includes('TAX') || serviceCodeUpper.includes('PLANNING')) {
              return 'Tax Planning';
            }
            if (serviceCodeUpper.includes('REGISTRATION') || serviceCodeUpper.includes('REG')) {
              return 'Registration';
            }
            if (serviceCodeUpper.includes('OUTSOURCE') || serviceCodeUpper.includes('BOOKKEEP')) {
              return 'Outsourcing';
            }
          }
          
          // Fourth try: Match by title pattern (fallback)
          if (sub.title) {
            const titleUpper = sub.title.toUpperCase();
            if (titleUpper.includes('GSTR') || titleUpper.includes('GST')) {
              return 'GST';
            }
            if (titleUpper.includes('ITR')) {
              return 'ITR';
            }
            if (titleUpper.includes('TAX PLANNING') || titleUpper.includes('TAX PLAN')) {
              return 'Tax Planning';
            }
            if (titleUpper.includes('REGISTRATION') || titleUpper.includes('REGISTER')) {
              return 'Registration';
            }
            if (titleUpper.includes('OUTSOURCE') || titleUpper.includes('BOOKKEEP')) {
              return 'Outsourcing';
            }
          }
          
          console.warn('⚠️ [ServicesPage] Could not determine category for sub-service:', {
            subServiceId: sub._id,
            subServiceTitle: sub.title,
            serviceCode: sub.serviceCode,
            serviceId: sub.serviceId,
            serviceIdType: typeof sub.serviceId
          });
          return 'Unknown';
        };
        
        // Log category breakdown for debugging
        const categoryBreakdown: { [key: string]: number } = {};
        const gstSubServices: any[] = [];
        const subServicesByCategory: { [key: string]: any[] } = {};
        
        activeSubServices.forEach(sub => {
          const category = getCategoryFromSubService(sub);
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
          
          if (!subServicesByCategory[category]) {
            subServicesByCategory[category] = [];
          }
          subServicesByCategory[category].push({
            _id: sub._id,
            title: sub.title,
            serviceId: sub.serviceId
          });
          
          // Track GST sub-services specifically
          if (category === 'GST' || category.toLowerCase() === 'gst') {
            gstSubServices.push({
              _id: sub._id,
              title: sub.title,
              serviceId: sub.serviceId,
              category: category
            });
          }
        });
        
        console.log('📋 [ServicesPage] Category breakdown:', JSON.stringify(categoryBreakdown, null, 2));
        console.log('📋 [ServicesPage] Sub-services by category:', Object.keys(subServicesByCategory).map(cat => ({
          category: cat,
          count: subServicesByCategory[cat].length,
          services: subServicesByCategory[cat].map((s: any) => s.title)
        })));
        console.log('📋 [ServicesPage] GST sub-services found:', gstSubServices.length);
        if (gstSubServices.length > 0) {
          console.log('📋 [ServicesPage] GST sub-services list:', JSON.stringify(gstSubServices, null, 2));
        }
        
        // Log sub-services with missing serviceId
        const subServicesWithMissingServiceId = activeSubServices.filter(sub => 
          !sub.serviceId || (typeof sub.serviceId === 'object' && sub.serviceId === null)
        );
        if (subServicesWithMissingServiceId.length > 0) {
          console.warn('⚠️ [ServicesPage] Sub-services with missing serviceId:', subServicesWithMissingServiceId.length);
          console.warn('⚠️ [ServicesPage] Missing serviceId sub-services:', subServicesWithMissingServiceId.map(s => ({
            _id: s._id,
            title: s.title
          })));
        }
        
        setServices(activeSubServices);
        setMainServices(activeMainServices);
      } catch (err: any) {
        console.error('❌ [ServicesPage] Error fetching services:', err);
        setError(`Failed to load services: ${err?.message || 'Unknown error'}`);
        setServices([]);
        setMainServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
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

  // Helper function to check if a service has free consultation
  const hasFreeConsultation = (serviceId: string): boolean => {
    const purchase = userPurchases.find(
      p => p.itemId === serviceId && p.itemType === 'service' && p.status === 'active'
    );
    
    if (!purchase) {
      return false;
    }
    
    // Check if it's a free consultation
    const payment = typeof purchase.paymentOrderId === 'object' && purchase.paymentOrderId
      ? purchase.paymentOrderId
      : null;
    
    if (payment && typeof payment === 'object' && 'status' in payment) {
      return (payment as any).status === 'free_consultation';
    }
    
    return false;
  };

  // Helper function to check if a service is already purchased (excluding free consultations)
  const isServicePurchased = (serviceId: string): boolean => {
    const purchase = userPurchases.find(
      p => p.itemId === serviceId && p.itemType === 'service' && p.status === 'active'
    );
    
    if (!purchase) {
      return false;
    }
    
    // Check if it's a free consultation - if so, don't mark as "purchased"
    const payment = typeof purchase.paymentOrderId === 'object' && purchase.paymentOrderId
      ? purchase.paymentOrderId
      : null;
    
    if (payment && typeof payment === 'object' && 'status' in payment) {
      const paymentStatus = (payment as any).status;
      // If it's a free consultation, it's not fully purchased yet
      if (paymentStatus === 'free_consultation') {
        return false;
      }
      // If it's paid (completed), then it's purchased
      if (paymentStatus === 'completed') {
        return true;
      }
    }
    
    // Default: if there's a purchase, consider it purchased (for backward compatibility)
    return true;
  };

  // Generate categories dynamically from sub-services
  // Group sub-services by main service category
  const mainCategories = ['ITR', 'GST', 'Tax Planning', 'Registration', 'Outsourcing'];
  const categoryMap = new Map<string, number>();
  
  // Helper function to normalize category name for matching
  const normalizeCategoryName = (name: string): string => {
    return name.trim();
  };
  
  // Helper function to extract category from serviceId (with fallback to serviceCode/title)
  const getCategoryFromServiceId = (serviceId: any, service?: SubService): string => {
    // First try: serviceId is populated as object
    if (typeof serviceId === 'object' && serviceId !== null) {
      let category = serviceId.category || serviceId.title || 'Other';
      category = normalizeCategoryName(category);
      
      // Try to match with main categories (case-insensitive)
      const matchedMainCategory = mainCategories.find(mc => 
        mc.toLowerCase() === category.toLowerCase() || 
        category.toLowerCase().includes(mc.toLowerCase()) ||
        mc.toLowerCase().includes(category.toLowerCase())
      );
      
      if (matchedMainCategory) {
        return matchedMainCategory;
      }
      return category;
    }
    
    // Second try: serviceId is a string ID - lookup in mainServices
    if (typeof serviceId === 'string') {
      const mainService = mainServices.find(s => s._id === serviceId);
      if (mainService) {
        let category = mainService.category || mainService.title || 'Other';
        category = normalizeCategoryName(category);
        
        const matchedMainCategory = mainCategories.find(mc => 
          mc.toLowerCase() === category.toLowerCase()
        );
        
        return matchedMainCategory || category;
      }
    }
    
    // Third try: Fallback to serviceCode/title pattern matching (if service object provided)
    if (service) {
      if (service.serviceCode) {
        const serviceCodeUpper = service.serviceCode.toUpperCase();
        if (serviceCodeUpper.includes('GSTR') || serviceCodeUpper.includes('GST')) return 'GST';
        if (serviceCodeUpper.includes('ITR')) return 'ITR';
        if (serviceCodeUpper.includes('TAX') || serviceCodeUpper.includes('PLANNING')) return 'Tax Planning';
        if (serviceCodeUpper.includes('REGISTRATION') || serviceCodeUpper.includes('REG')) return 'Registration';
        if (serviceCodeUpper.includes('OUTSOURCE') || serviceCodeUpper.includes('BOOKKEEP')) return 'Outsourcing';
      }
      
      if (service.title) {
        const titleUpper = service.title.toUpperCase();
        if (titleUpper.includes('GSTR') || titleUpper.includes('GST')) return 'GST';
        if (titleUpper.includes('ITR')) return 'ITR';
        if (titleUpper.includes('TAX PLANNING') || titleUpper.includes('TAX PLAN')) return 'Tax Planning';
        if (titleUpper.includes('REGISTRATION') || titleUpper.includes('REGISTER')) return 'Registration';
        if (titleUpper.includes('OUTSOURCE') || titleUpper.includes('BOOKKEEP')) return 'Outsourcing';
      }
    }
    
    if (!serviceId) {
      console.warn('⚠️ [ServicesPage] getCategoryFromServiceId: serviceId is null/undefined', service ? { title: service.title, serviceCode: service.serviceCode } : '');
    } else {
      console.warn('⚠️ [ServicesPage] getCategoryFromServiceId: Could not determine category', { serviceId, service: service ? { title: service.title, serviceCode: service.serviceCode } : null });
    }
    return 'Other';
  };
  
  // Count sub-services by category and log details
  const categoryDetails: { [key: string]: any[] } = {};
  services.forEach(service => {
    const category = getCategoryFromServiceId(service.serviceId, service);
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    
    // Store details for debugging
    if (!categoryDetails[category]) {
      categoryDetails[category] = [];
    }
    categoryDetails[category].push({
      title: service.title,
      serviceIdType: typeof service.serviceId,
      serviceId: service.serviceId,
      extractedCategory: category
    });
  });
  
  // Debug: Log category mapping with details
  console.log('📊 [ServicesPage] Category map:', Array.from(categoryMap.entries()).map(([cat, count]) => `${cat}: ${count}`).join(', '));
  console.log('📊 [ServicesPage] Category details:', JSON.stringify(categoryDetails, null, 2));
  
  // Log main services for reference
  console.log('📊 [ServicesPage] Main services available:', mainServices.map(s => ({
    _id: s._id,
    title: s.title,
    category: s.category
  })));
  
  // Only show sub-services, not main services
  // Main services are just categories - users should see the actual sub-services
  const combinedServices: SubService[] = [...services];

  // Show categories with their actual sub-service counts
  // Only show categories that have sub-services (or show all with 0 count for visibility)
  const categories = [
    { id: 'all', name: 'All Services', count: combinedServices.length },
    ...mainCategories.map(category => ({
      id: category.toLowerCase().replace(/\s+/g, '-'),
      name: category,
      count: categoryMap.get(category) || 0
    }))
  ];
  
  console.log('📊 [ServicesPage] Category counts:', categories.map(c => `${c.name}: ${c.count}`).join(', '));

  // Helper function to normalize category for comparison
  const normalizeCategory = (category: string): string => {
    return category.toLowerCase().trim().replace(/\s+/g, '-');
  };
  
  // Filter services based on selected category
  const filteredServices = selectedCategory === 'all' 
    ? combinedServices 
    : combinedServices.filter(service => {
        const serviceCategory = getCategoryFromServiceId(service.serviceId, service);
        const normalizedServiceCategory = normalizeCategory(serviceCategory);
        
        // selectedCategory is already normalized (e.g., "gst", "tax-planning")
        // So we just need to compare normalizedServiceCategory with selectedCategory
        const matches = normalizedServiceCategory === selectedCategory;
        
        // Also check if the service category matches the main category name directly
        // This handles cases where category might be "GST" but selectedCategory is "gst"
        const mainCategoryMatch = mainCategories.some(mainCat => {
          const normalizedMainCat = normalizeCategory(mainCat);
          return normalizedMainCat === selectedCategory && 
                 (normalizeCategory(serviceCategory) === normalizedMainCat ||
                  serviceCategory.toLowerCase() === mainCat.toLowerCase());
        });
        
        const finalMatch = matches || mainCategoryMatch;
        
        // Debug logging for GST filter
        if (selectedCategory === 'gst') {
          if (!finalMatch) {
            console.log('🔍 [ServicesPage] GST filter - Service does not match:', {
              serviceTitle: service.title,
              serviceCategory: serviceCategory,
              normalizedServiceCategory: normalizedServiceCategory,
              selectedCategory: selectedCategory,
              serviceId: service.serviceId,
              matches: matches,
              mainCategoryMatch: mainCategoryMatch
            });
          } else {
            console.log('✅ [ServicesPage] GST filter - Service matches:', {
              serviceTitle: service.title,
              serviceCategory: serviceCategory
            });
          }
        }
        
        return finalMatch;
      });
  
  // Debug logging for filtered services
  if (selectedCategory === 'gst') {
    console.log('📊 [ServicesPage] GST filter results:', {
      selectedCategory: selectedCategory,
      totalServices: combinedServices.length,
      filteredCount: filteredServices.length,
      filteredServices: filteredServices.map(s => ({
        title: s.title,
        category: getCategoryFromServiceId(s.serviceId)
      }))
    });
  }

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
                        {hasFreeConsultation(service._id) ? (
                          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-bold">
                            Free Consultation
                          </span>
                        ) : isServicePurchased(service._id) && (
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
                      {service.price > 0 ? (
                        <span className="text-[#007AFF] font-bold">₹{service.price}</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Contact for pricing</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="relative">
                      <button
                        onClick={() => onNavigate('service-details', service._id)}
                        className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm border border-[#007AFF] text-[#007AFF] dark:text-[#007AFF] hover:bg-[#007AFF] hover:text-white cursor-pointer"
                        title="View service details"
                      >
                        View Details
                      </button>
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
                        <button
                          onClick={() => isAuthenticated ? onNavigate('service-details', service._id) : onNavigate('login')}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
                            isAuthenticated 
                              ? 'bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white hover:shadow-lg cursor-pointer' 
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }`}
                          title={isAuthenticated ? 'Get quotation for this service' : 'Please login to get quotation'}
                        >
                          {isAuthenticated ? 'Get Quotation' : 'Login to Get Quotation'}
                        </button>
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
