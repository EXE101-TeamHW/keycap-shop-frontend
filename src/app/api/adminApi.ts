import axiosClient from './axiosClient';
import { mapProduct } from './productApi';

export const adminApi = {
  // Users
  getUsers: () => axiosClient.get('/admin/users'),
  updateUserRole: (id: string, role: string) => axiosClient.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id: string, status: string) => axiosClient.put(`/admin/users/${id}/status`, { status }),

  // Products - mapped to normalize backend field names
  getProducts: () =>
    axiosClient.get('/admin/products').then((res: any) => ({
      ...res,
      data: Array.isArray(res.data) ? res.data.map(mapProduct) : [],
    })),
  createProduct: (data: any) => axiosClient.post('/admin/products', data),
  updateProduct: (id: string | number, data: any) => axiosClient.put(`/admin/products/${id}`, data),
  // Backend has no DELETE — deactivate by setting status to INACTIVE
  deactivateProduct: (id: string | number, currentData: any) =>
    axiosClient.put(`/admin/products/${id}`, { ...currentData, status: 'INACTIVE' }),

  // Orders
  getOrders: () => axiosClient.get('/admin/orders'),
  getAllOrders: () => axiosClient.get('/admin/orders'),

  /** Admin approves + assigns staff → auto-creates conversation */
  confirmAndAssign: (orderId: string | number, staffId: string | number) =>
    axiosClient.put(`/admin/orders/${orderId}/confirm-assign?staffId=${staffId}`),

  /** Admin cancels a PENDING/CONFIRMED order */
  cancelOrder: (orderId: string | number) =>
    axiosClient.put(`/admin/orders/${orderId}/cancel`),

  // Reviews
  getReviews: () => axiosClient.get('/admin/reviews'),
  getReviewCount: () => axiosClient.get('/admin/reviews/count'),
  deleteReview: (id: string | number) => axiosClient.delete(`/admin/reviews/${id}`),
};
