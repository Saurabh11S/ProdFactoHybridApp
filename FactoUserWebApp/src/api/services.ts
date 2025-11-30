import axiosInstance from '../utils/axiosConfig';
import { API_BASE_URL } from '../config/apiConfig';

// Service interfaces based on backend models
export interface Service {
  _id: string;
  title: string;
  category: string;
  description: string;
  isActive: boolean;
  icon: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubService {
  _id: string;
  serviceCode: string;
  serviceId: string | {
    _id: string;
    title: string;
    category: string;
    isActive?: boolean;
  } | null;
  title: string;
  description: string;
  features: string[];
  price: number;
  period: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'one_time';
  isActive: boolean;
  pricingStructure: Array<{
    price: number;
    period: string;
  }>;
  requests: Array<{
    name: string;
    priceModifier: number;
    needsQuotation: boolean;
    inputType: 'dropdown' | 'checkbox';
    isMultipleSelect: boolean;
    options: Array<{
      name: string;
      priceModifier: number;
      needsQuotation: boolean;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data: {
    services?: Service[];
    subServices?: SubService[];
  };
}

// Fetch all services
export const fetchServices = async (): Promise<Service[]> => {
  try {
    const url = `/services`;
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('🔄 Fetching services from:', fullUrl);
    console.log('🌐 Full API URL:', fullUrl);
    // Timeout is optimized based on Render.com plan (see renderPlanConfig.ts)
    const response = await axiosInstance.get<ServiceResponse>(url);
    console.log('📦 Full API Response:', JSON.stringify(response.data, null, 2));
    
    // Handle different response structures
    let services: Service[] = [];
    
    if (response.data?.data?.services) {
      services = response.data.data.services;
    } else if (Array.isArray(response.data?.data)) {
      services = response.data.data;
    } else if (Array.isArray(response.data)) {
      services = response.data;
    }
    
    console.log('✅ Extracted services:', services.length);
    console.log('📋 Services list:', services.map(s => ({ 
      _id: s._id, 
      title: s.title, 
      category: s.category, 
      isActive: s.isActive 
    })));
    
    return services;
  } catch (error: any) {
    console.error('❌ Error fetching services:', error);
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      url: error?.config?.url
    });
    
    // Check for specific error conditions
    if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
      const errorMsg = error?.config?.url?.includes('onrender.com') 
        ? 'Backend service is unavailable. Please check if the backend server is running or reactivate the Render.com service. The service may be starting up (can take 30-60 seconds).'
        : 'Cannot connect to backend server. Please check your internet connection and try again.';
      throw new Error(errorMsg);
    }
    
    if (error?.response?.status === 503 || error?.message?.includes('suspended')) {
      throw new Error('Backend service has been suspended. Please reactivate the service or use a local backend.');
    }
    
    throw new Error(`Failed to fetch services: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
  }
};

// Fetch sub-services by service ID
export const fetchSubServices = async (serviceId: string): Promise<SubService[]> => {
  try {
    const url = `/sub-services/service/${serviceId}`;
    console.log('🔄 [fetchSubServices] Fetching from:', `${API_BASE_URL}${url}`);
    const response = await axiosInstance.get<ServiceResponse>(url);
    
    // Handle different response structures
    let subServices: SubService[] = [];
    
    if (response.data?.data?.subServices) {
      subServices = response.data.data.subServices;
    } else if (Array.isArray(response.data?.data)) {
      subServices = response.data.data;
    } else if (Array.isArray(response.data)) {
      subServices = response.data;
    }
    
    console.log(`✅ [fetchSubServices] Fetched ${subServices.length} sub-services for service ${serviceId}`);
    return subServices;
  } catch (error: any) {
    console.error('❌ [fetchSubServices] Error fetching sub-services:', error);
    console.error('❌ [fetchSubServices] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      url: error?.config?.url
    });
    throw new Error(`Failed to fetch sub-services: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
  }
};

// Fetch all sub-services directly
export const fetchAllSubServices = async (): Promise<SubService[]> => {
  try {
    const url = `/sub-services/all`;
    console.log('🔄 [fetchAllSubServices] Fetching from:', `${API_BASE_URL}${url}`);
    const response = await axiosInstance.get<ServiceResponse>(url);
    
    console.log('📦 [fetchAllSubServices] Full response:', JSON.stringify(response.data, null, 2));
    console.log('📦 [fetchAllSubServices] Response structure:', {
      hasData: !!response.data,
      hasDataData: !!response.data?.data,
      hasSubServices: !!response.data?.data?.subServices,
      isArray: Array.isArray(response.data?.data?.subServices),
      subServicesLength: response.data?.data?.subServices?.length || 0
    });
    
    // Handle different response structures
    let subServices: SubService[] = [];
    
    if (response.data?.data?.subServices) {
      subServices = response.data.data.subServices;
    } else if (Array.isArray(response.data?.data)) {
      subServices = response.data.data;
    } else if (Array.isArray(response.data)) {
      subServices = response.data;
    }
    
    console.log('✅ [fetchAllSubServices] Extracted sub-services:', subServices.length);
    
    // Detailed logging of ALL sub-services with full details
    console.log('📋 [fetchAllSubServices] Complete sub-services list:', subServices.map(s => {
      const serviceIdInfo = s.serviceId 
        ? (typeof s.serviceId === 'object' && s.serviceId !== null
          ? {
              type: 'object',
              _id: (s.serviceId as any)._id,
              title: (s.serviceId as any).title,
              category: (s.serviceId as any).category,
              isActive: (s.serviceId as any).isActive
            }
          : {
              type: 'string',
              value: s.serviceId
            })
        : { type: 'null', value: null };
      
      return {
        _id: s._id,
        title: s.title,
        serviceCode: s.serviceCode,
        isActive: s.isActive,
        serviceId: serviceIdInfo
      };
    }));
    
    // Group by category for summary
    const categorySummary: { [key: string]: number } = {};
    subServices.forEach(s => {
      let category = 'Unknown';
      if (typeof s.serviceId === 'object' && s.serviceId !== null) {
        category = (s.serviceId as any).category || (s.serviceId as any).title || 'Unknown';
      } else if (typeof s.serviceId === 'string') {
        category = 'String ID (needs lookup)';
      }
      categorySummary[category] = (categorySummary[category] || 0) + 1;
    });
    console.log('📊 [fetchAllSubServices] Category summary:', JSON.stringify(categorySummary, null, 2));
    
    return subServices;
  } catch (error: any) {
    console.error('❌ [fetchAllSubServices] Error fetching all sub-services:', error);
    console.error('❌ [fetchAllSubServices] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      url: error?.config?.url
    });
    
    // Fallback to the old method if the new endpoint fails
    try {
      console.log('🔄 [fetchAllSubServices] Attempting fallback method...');
      const services = await fetchServices();
      const allSubServices: SubService[] = [];
      
      for (const service of services) {
        if (service.isActive) {
          try {
            const subServices = await fetchSubServices(service._id);
            allSubServices.push(...subServices);
            console.log(`✅ [fetchAllSubServices] Fetched ${subServices.length} sub-services for service ${service.title}`);
          } catch (error) {
            console.warn(`⚠️ [fetchAllSubServices] Failed to fetch sub-services for service ${service._id}:`, error);
          }
        }
      }
      
      console.log(`✅ [fetchAllSubServices] Fallback method returned ${allSubServices.length} sub-services`);
      return allSubServices;
    } catch (fallbackError) {
      console.error('❌ [fetchAllSubServices] Fallback method also failed:', fallbackError);
      
      // Provide helpful error message
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        const errorMsg = error?.config?.url?.includes('onrender.com') 
          ? 'Backend service is unavailable. Please check if the backend server is running or reactivate the Render.com service. The service may be starting up (can take 30-60 seconds).'
          : 'Cannot connect to backend server. Please check your internet connection and try again.';
        throw new Error(errorMsg);
      }
      
      throw new Error(`Failed to fetch sub-services: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    }
  }
};

// Fetch user's purchased services
export const fetchUserServices = async (token: string): Promise<SubService[]> => {
  try {
      const response = await axiosInstance.get<ServiceResponse>(`/sub-services/my-services`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data.subServices || [];
  } catch (error) {
    console.error('Error fetching user services:', error);
    throw new Error('Failed to fetch user services');
  }
};

// Fetch a single sub-service by ID
export const fetchSubServiceById = async (subServiceId: string, _forceRefresh: boolean = false): Promise<SubService> => {
  try {
    // Always add cache-busting timestamp to ensure fresh data from database
    // Using query parameters only to avoid CORS header issues
    const timestamp = Date.now();
    const random = Math.random();
    const url = `/sub-services/${subServiceId}?t=${timestamp}&_=${random}`;
    
    const response = await axiosInstance.get<{ success: boolean; data: { subService: SubService } }>(
      url
    );
    
    if (response.data.success && response.data.data && response.data.data.subService) {
      const subService = response.data.data.subService;
      
      // Validate inputType for each request
      if (subService.requests && Array.isArray(subService.requests)) {
        subService.requests.forEach((req: any) => {
          const normalizedType = (req.inputType || '').toLowerCase();
          if (!req.inputType) {
            console.warn(`Warning: inputType is missing for request "${req.name}"`);
          } else if (!['dropdown', 'checkbox'].includes(normalizedType)) {
            console.warn(`Warning: Unexpected inputType "${req.inputType}" for request "${req.name}"`);
          }
        });
      }
      
      return subService;
    }
    
    throw new Error('Sub-service not found in response');
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch sub-service';
    
    // Preserve the original error with status code for better error handling
    const enhancedError: any = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    enhancedError.config = error.config;
    throw enhancedError;
  }
};
