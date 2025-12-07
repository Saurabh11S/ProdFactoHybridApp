import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

export interface DocumentRequirement {
  _id: string;
  title: string;
  description: string;
  isMandatory: boolean;
}

export interface DocumentRequirementsResponse {
  success: boolean;
  message: string;
  data: {
    requirements: DocumentRequirement[];
  };
}

/**
 * Fetch document requirements for a service from the master table
 * @param serviceId - The sub-service ID
 * @param token - Authentication token
 * @returns Array of document requirements
 */
export const fetchDocumentRequirements = async (
  serviceId: string,
  token: string
): Promise<DocumentRequirement[]> => {
  try {
    const response = await axios.get<DocumentRequirementsResponse>(
      `${API_BASE_URL}/document/requirements/service/${serviceId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success && response.data.data?.requirements) {
      return response.data.data.requirements;
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching document requirements:', error);
    // Return empty array instead of throwing to allow fallback
    return [];
  }
};

