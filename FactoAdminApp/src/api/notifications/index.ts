import { api } from '../../config/axiosConfig';
import { defineCancelApiObject } from '../../utils/axiosUtils';
const cancelApiObject = defineCancelApiObject(api);
export const NOTIFICATIONS = {

    Get: async (cancel = false) => {
    const response = await api.request({
      url: '/admin/notification',
      method: 'GET',
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.Get.handleRequestCancellation().signal
        : undefined,
    });
    console.log(response.data);
    return response.data;
  },
  Post: async (data: any, cancel = false) => {
    const response = await api.request({
      url: '/admin/notification',
      method: 'POST',
      data: {
        title: data.title,
        content: data.content,
      },
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.PostEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
  Update: async (data: any, cancel = false) => {
    const response = await api.request({
      url: `/admin/notification/${data._id}`,
      method: 'PUT',
      data: {
        title: data.title,
        content: data.content,
      },
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.UpdateEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
  Delete: async (id: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/notification/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.DeleteEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
}