import { api } from "../../config/axiosConfig";
import { defineCancelApiObject } from "../../utils/axiosUtils";
const cancelApiObject = defineCancelApiObject(api);
export const SUBSERVICES = {
  GetSubServices: async (id: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/sub-services/${id}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ` + localStorage.getItem("token"),
      },
      signal: cancel
        ? cancelApiObject.Get.handleRequestCancellation().signal
        : undefined,
    });
    return response.data;
  },
  PostSubService: async (id: string, data: any, cancel = false) => {
    const response = await api.request({
      url: `/admin/sub-service/${id}`,
      method: "POST",
      data: data,
      headers: {
        Authorization: `Bearer ` + localStorage.getItem("token"),
      },
      signal: cancel
        ? cancelApiObject.PostEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },

  DeactivateSubService: async (id: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/sub-service/toggle/${id}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ` + localStorage.getItem("token"),
      },
      signal: cancel
        ? cancelApiObject.GetById.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
  UpdateSubService: async (data: any, cancel = false) => {
    const { _id, ...rest } = data;
    const response = await api.request({
      url: `/admin/sub-service/${data._id}`,
      method: "PUT",
      data: rest,
      headers: {
        Authorization: `Bearer ` + localStorage.getItem("token"),
      },
      signal: cancel
        ? cancelApiObject.UpdateEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },

  DeleteSubService: async (id: string, cancel = false) => {
    const response = await api.request({
      url: `/admin/sub-service/${id}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ` + localStorage.getItem("token"),
      },
      signal: cancel
        ? cancelApiObject.DeleteEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
};
