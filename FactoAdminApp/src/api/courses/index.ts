import { api } from '../../config/axiosConfig';
import { defineCancelApiObject } from '../../utils/axiosUtils';
const cancelApiObject = defineCancelApiObject(api);
export const COURSES = {
  GetCoursesById: async (data:string,cancel = false) => {
    const response = await api.request({
      url: `/admin/courses/${data}`,
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
    GetCourses: async (cancel = false) => {
    const response = await api.request({
      url: '/admin/courses',
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
  PostCourse: async (data: any, cancel = false) => {
    const response = await api.request({
      url: '/admin/courses',
      method: 'POST',
      data: {
        title: data.title,
        description: data.description, 
        category: data.category,
        language: data.language,
        duration: {
          value:data.duration.value,
          unit:data.duration.unit,
        },
        price: data.price,
        totalLectures: data.totalLectures
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
  UpdateCourse: async (data: any,courseId:string, cancel = false) => {
    const response = await api.request({
      url: `/admin/courses/${courseId}`,
      method: 'PUT',
      data: {
        title: data.title,
        description: data.description, 
        category: data.category,
        language: data.language,
        duration: {
          value:data.duration.value,
          unit:data.duration.unit,
        },
        price: data.price,
        totalLectures: data.totalLectures
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
  PostLecture: async (data: FormData,id:string, cancel = false) => {
    const response = await api.request({
      url: `/admin/courses/${id}/lectures`,
      method: 'POST',
      data: data,
      
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.PostEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
  UpdateLecture: async (data: FormData,courseId:string,lectureId:string, cancel = false) => {
    const response = await api.request({
      url: `/admin/courses/${courseId}/lectures/${lectureId}`,
      method: 'PUT',
      data: data,
      
      headers: {
        Authorization: `Bearer ` + localStorage.getItem('token'),
      },
      signal: cancel
        ? cancelApiObject.PostEmployee.handleRequestCancellation().signal
        : undefined,
    });

    return response.data;
  },
  GetLectures: async (courseId:string, cancel= false) =>{
    const response = await api.request({
      url:`/admin/courses/${courseId}/lectures`,
      method:"GET",
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
  PublishCourse: async (courseId:string, cancel= false) =>{
    const response = await api.request({
      url:`admin/courses/${courseId}/publish`,
      method:"PATCH",
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
}