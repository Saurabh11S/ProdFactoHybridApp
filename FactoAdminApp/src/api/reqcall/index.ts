import { api } from '../../config/axiosConfig';
import { defineCancelApiObject } from '../../utils/axiosUtils';
const cancelApiObject = defineCancelApiObject(api);
export const REQCALL = {

    Get: async (cancel = false) => {
    const response = await api.request({
      url: '/admin/request',
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
      url: '/admin/request',
      method: 'POST',
      data: {
        phoneNo: data.phoneNo,
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
  AssignEmployee: async (requestId: string, employeeId: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/request/${requestId}`,
      method: 'POST',
      data: {
        employeeId: employeeId,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      signal: cancel
        ? cancelApiObject.AssignEmployee.handleRequestCancellation().signal
        : undefined,
    });
  
    return response.data;
  },
 
}