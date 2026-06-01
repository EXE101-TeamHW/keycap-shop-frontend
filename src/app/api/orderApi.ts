import axiosClient from './axiosClient';

export const orderApi = {
  // Backend: POST /api/orders - tạo đơn hàng Shop
  createOrder: (data: {
    userId?: number;
    type?: string;
    shippingAddress: string;
    paymentMethod?: string;
    ticketId?: number;
    items?: any[];
    totalAmount?: number;
    shippingFee?: number;
  }) => {
    return axiosClient.post('/orders', { type: 'SHOP', paymentMethod: 'COD', items: [], ...data });
  },

  // Backend: GET /api/orders
  getMyOrders: () => {
    return axiosClient.get(`/orders`);
  },

  // Backend: GET /api/orders/staff
  getStaffOrders: () => {
    return axiosClient.get(`/orders/staff`);
  },

  // Backend: GET /api/orders/{id}
  getOrderById: (id: string | number) => axiosClient.get(`/orders/${id}`),

  // Backend: PUT /api/orders/{id}/cancel
  cancelOrder: (id: string | number) => axiosClient.put(`/orders/${id}/cancel`),

  // Backend: PUT /api/orders/{id}/status
  updateStatus: (id: string | number, status: string) =>
    axiosClient.put(`/orders/${id}/status`, { status }),

  assignStaff: (id: string | number, staffId: string | number) => {
    return axiosClient.put(`/orders/${id}/assign?staffId=${staffId}`);
  },

  // Backend: PUT /api/orders/{id}/refund
  refundOrder: (id: string | number) => {
    return axiosClient.put(`/orders/${id}/refund`);
  },
};
