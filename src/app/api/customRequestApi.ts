import axiosClient from './axiosClient';

export const customRequestApi = {
  create: (data: any) => axiosClient.post('/custom-requests', data),
  // Backend: GET /api/custom-requests?userId=X
  getAll: (userId?: number) => {
    const uid = userId ?? parseInt(localStorage.getItem('userId') || '0');
    return axiosClient.get(`/custom-requests?userId=${uid}`);
  },
  getById: (id: string | number) => axiosClient.get(`/custom-requests/${id}`),
};
