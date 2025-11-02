import { api } from '@/config/axiosConfig';
import { defineCancelApiObject } from '../../utils/axiosUtils';
const cancelApiObject = defineCancelApiObject(api);
// import { cancelApiObject } from './cancelApiObject';

export const BLOGS = {
  GetBlogs: async (cancel = false) => {
    const response = await api.request({
      url: '/admin/blogs',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      signal: cancel
        ? cancelApiObject.Get.handleRequestCancellation().signal
        : undefined,
    });
    console.log(response.data);
    return response.data;
  },

  PostBlogs: async (data: FormData, cancel = false) => {
    const response = await api.request({
      url: '/admin/blogs',
      method: 'POST',
      data: data,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
      signal: cancel
        ? cancelApiObject.PostEmployee.handleRequestCancellation().signal
        : undefined,
    });
  
    return response.data;
  },

  Update: async (data: FormData, cancel = false) => {
    const response = await api.request({
      url: `/admin/blogs/${data.get('_id')}`,
      method: 'PUT',
      data: data,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
      signal: cancel
        ? cancelApiObject.UpdateEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },

  Delete: async (id: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/blogs/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      signal: cancel
        ? cancelApiObject.DeleteEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
};

