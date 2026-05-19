import axiosClient from './axiosClient';

export const customRequestApi = {
  create: (data: any) => axiosClient.post('/custom-requests', data),
  getAll: () => axiosClient.get('/custom-requests'),
  getById: (id: string) => axiosClient.get(`/custom-requests/${id}`)
};
