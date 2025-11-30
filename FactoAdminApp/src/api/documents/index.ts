import { api } from '../../config/axiosConfig';
import { defineCancelApiObject } from '../../utils/axiosUtils';
const cancelApiObject = defineCancelApiObject(api);
export const DOCUMENTS = {

    GetDocumentsBySubServices: async (id:string,cancel = false) => {
    const response = await api.request({
      url: `/admin/sub-services-requirement/${id}`,
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

  PostDocuments: async (id:string,data: any, cancel = false) => {
    console.log("This is new data",data)

    const response = await api.request({
      url: `/admin/sub-services-requirement/${id}`,
      method: 'POST',
      data: {
        title: data.title,
        description: data.description,
        isMandatory: data.isMandatory,
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
  UpdateDocuments: async (data: any, cancel = false) => {
    const response = await api.request({
      url: `/admin/sub-services-requirement/${data._id}`,
      method: 'PUT',
      data: {
        title: data.title,
        description: data.description,
        isMandatory: data.isMandatory,
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
  ToggleMandatory : async (id:string, cancel = false) => {
    console.log("toggle",id);
    const response = await api.request({
      url: `/admin/sub-services-requirement/toggle/${id}`,
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
  DeleteSubServiceDoc: async (id: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/sub-services-requirement/${id}`,
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