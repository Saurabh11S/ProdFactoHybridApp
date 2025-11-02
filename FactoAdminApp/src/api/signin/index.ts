import { api } from '../../config/axiosConfig';
import { defineCancelApiObject } from '../../utils/axiosUtils';
const cancelApiObject = defineCancelApiObject(api);
export const AUTH = {
  PostLogin: async (data: any, cancel = false) => {
    console.log("yp",data);
    const response = await api.request({
      url: '/admin/login',
      method: 'POST',
      data: {
        email: data.email,
        password: data.password,
      },
      signal: cancel
        ? cancelApiObject.PostLogin.handleRequestCancellation().signal
        : undefined,
    });
console.log("this",response.data);
    return response.data;
  },
};
