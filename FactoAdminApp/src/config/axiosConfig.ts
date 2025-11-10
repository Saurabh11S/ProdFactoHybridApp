import axios from 'axios';
import { BASE_URL } from '../utils/apiConstants';

export const api = axios.create({
  withCredentials: false,
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

const errorHandler = (error: any) => {
  const statusCode = error.response?.status;

  // Log errors for debugging (except 401 which is handled in components)
  if (statusCode && statusCode !== 401) {
    console.error('❌ API Error:', {
      status: statusCode,
      url: error.config?.url,
      method: error.config?.method,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
  }

  return Promise.reject(error);
};

api.interceptors.response.use(undefined, (error) => {
  return errorHandler(error);
});
