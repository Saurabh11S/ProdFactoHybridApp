import { api } from '../../config/axiosConfig';
import { defineCancelApiObject } from '../../utils/axiosUtils';
const cancelApiObject = defineCancelApiObject(api);
export const SERVICES = {

    GetServices: async (cancel = false) => {
    const response = await api.request({
      url: '/admin/service',
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
  PostService: async (data: any, cancel = false) => {
    console.log("This is new data",data)

    const response = await api.request({
      url: '/admin/service',
      method: 'POST',
      data: data,
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.PostEmployee.handleRequestCancellation().signal
        : undefined,
    });
    console.log("This is response data",response.data)

    return response.data;
  },
  ToggleService: async (id:string, cancel = false) => {
    console.log("toggle",id);
    const response = await api.request({
      url: `/admin/service/toggle/${id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.GetById.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
  UpdateService: async (data: any, cancel = false) => {
    const response = await api.request({
      url: `/admin/service/${data._id}`,
      method: 'PUT',
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon,
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
  DeleteService: async (id: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/service/${id}`,
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
  GetServiceUsers: async (serviceId: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/services/${serviceId}/users`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.GetById.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
  GetUserServiceDocuments: async (userId: string, serviceId: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/users/${userId}/services/${serviceId}/documents`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.GetById.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
  GetAllUserDocuments: async (userId: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/users/${userId}/documents`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.GetById.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
  GetServiceConsultations: async (serviceId: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/services/${serviceId}/consultations`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.GetById.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
}
