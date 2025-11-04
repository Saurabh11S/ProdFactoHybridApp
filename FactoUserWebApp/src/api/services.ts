import axios from 'axios';
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
  serviceId: {
    _id: string;
    title: string;
    category: string;
  };
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
    console.log('Fetching services from:', `${API_BASE_URL}/services`);
    const response = await axios.get<ServiceResponse>(`${API_BASE_URL}/services`);
    console.log('Services response:', response.data);
    return response.data.data.services || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error('Failed to fetch services');
  }
};

// Fetch sub-services by service ID
export const fetchSubServices = async (serviceId: string): Promise<SubService[]> => {
  try {
    const response = await axios.get<ServiceResponse>(`${API_BASE_URL}/sub-services/service/${serviceId}`);
    return response.data.data.subServices || [];
  } catch (error) {
    console.error('Error fetching sub-services:', error);
    throw new Error('Failed to fetch sub-services');
  }
};

// Fetch all sub-services directly
export const fetchAllSubServices = async (): Promise<SubService[]> => {
  try {
    const response = await axios.get<ServiceResponse>(`${API_BASE_URL}/sub-services/all`);
    console.log('Sub-services response:', response.data);
    return response.data.data.subServices || [];
  } catch (error) {
    console.error('Error fetching all sub-services:', error);
    // Fallback to the old method if the new endpoint fails
    try {
      const services = await fetchServices();
      const allSubServices: SubService[] = [];
      
      for (const service of services) {
        if (service.isActive) {
          try {
            const subServices = await fetchSubServices(service._id);
            allSubServices.push(...subServices);
          } catch (error) {
            console.warn(`Failed to fetch sub-services for service ${service._id}:`, error);
          }
        }
      }
      
      return allSubServices;
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
      throw new Error('Failed to fetch sub-services');
    }
  }
};

// Fetch user's purchased services
export const fetchUserServices = async (token: string): Promise<SubService[]> => {
  try {
    const response = await axios.get<ServiceResponse>(`${API_BASE_URL}/sub-services/my-services`, {
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
