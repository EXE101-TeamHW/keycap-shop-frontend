import axiosClient from './axiosClient';

export const customRequestApi = {
  create: (data: any) => axiosClient.post('/custom-requests', data),
  // Backend: GET /api/custom-requests
  getAll: () => {
    return axiosClient.get(`/custom-requests`);
  },
  getById: (id: string | number) => axiosClient.get(`/custom-requests/${id}`),
};
