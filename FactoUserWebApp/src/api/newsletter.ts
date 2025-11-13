import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

export interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    subscription?: {
      _id: string;
      email: string;
      isActive: boolean;
      subscribedAt: string;
    };
  };
}

/**
 * Subscribe to newsletter
 */
export const subscribeToNewsletter = async (email: string): Promise<NewsletterSubscriptionResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/newsletter/subscribe`, {
      email,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to subscribe to newsletter'
    );
  }
};

/**
 * Unsubscribe from newsletter
 */
export const unsubscribeFromNewsletter = async (email: string): Promise<NewsletterSubscriptionResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/newsletter/unsubscribe`, {
      email,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error unsubscribing from newsletter:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to unsubscribe from newsletter'
    );
  }
};

