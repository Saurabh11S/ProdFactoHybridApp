import { api } from '@/config/axiosConfig';

export const NEWSLETTER = {
  GetAllSubscriptions: async (page = 1, limit = 50, isActive?: boolean) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (isActive !== undefined) {
      params.append('isActive', isActive.toString());
    }

    const response = await api.request({
      url: `/newsletter/all?${params.toString()}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  GetStats: async () => {
    const response = await api.request({
      url: '/newsletter/stats',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },
};

