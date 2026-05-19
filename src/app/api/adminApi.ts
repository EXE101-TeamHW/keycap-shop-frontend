import axiosClient from './axiosClient';

export const adminApi = {
  getUsers: () => axiosClient.get('/admin/users'),
  updateUserRole: (id: string, role: string) => axiosClient.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id: string, status: string) => axiosClient.put(`/admin/users/${id}/status`, { status }),
  getProducts: () => axiosClient.get('/admin/products'),
  createProduct: (data: any) => axiosClient.post('/admin/products', data),
  updateProduct: (id: string, data: any) => axiosClient.put(`/admin/products/${id}`, data),
  getOrders: () => axiosClient.get('/admin/orders')
};
