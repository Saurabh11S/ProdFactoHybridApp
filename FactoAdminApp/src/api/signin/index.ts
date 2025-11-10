import { api } from '../../config/axiosConfig';
import { defineCancelApiObject } from '../../utils/axiosUtils';
const cancelApiObject = defineCancelApiObject(api);
export const AUTH = {
  PostLogin: async (data: any, cancel = false) => {
    try {
      console.log("📤 Sending login request:", { email: data.email, password: '***' });
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
      console.log("✅ Login response received:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Login API error:", error);
      // Re-throw to let the component handle it
      throw error;
    }
  },
};
