import { api } from '../../config/axiosConfig';
import { defineCancelApiObject } from '../../utils/axiosUtils';
const cancelApiObject = defineCancelApiObject(api);
export const EMPLOYEE = {

    GetEmployees: async (cancel = false) => {
    const response = await api.request({
      url: '/admin/employees',
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
  PostEmployee: async (data: any, cancel = false) => {
    console.log("This is new data",data)

    const response = await api.request({
      url: '/admin/add-employee',
      method: 'POST',
      data: {
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
      },
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
  GetById: async (id:string, cancel = false) => {
    console.log(id);
    const response = await api.request({
      url: `/admin/employee/${id}`,
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
  Update: async (data: any, cancel = false) => {
    const response = await api.request({
      url: `/admin/employee/${data._id}`,
      method: 'PUT',
      data: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
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
      url: `/admin/employee/${id}`,
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