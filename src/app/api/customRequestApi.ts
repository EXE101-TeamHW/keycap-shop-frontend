import axiosClient from './axiosClient';

export const customRequestApi = {
  create: (data: any) => axiosClient.post('/custom-requests', data),
  checkout: (data: any) => axiosClient.post('/custom-requests/checkout', data),
  // Backend: GET /api/custom-requests
  getAll: () => {
    return axiosClient.get(`/custom-requests`);
  },
  getPaged: (page = 0, size = 10) => axiosClient.get(`/custom-requests/paged?page=${page}&size=${size}`),
  getById: (id: string | number) => axiosClient.get(`/custom-requests/${id}`),
};
