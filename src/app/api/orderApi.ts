import axiosClient from './axiosClient';

export const orderApi = {
  // Backend: POST /api/orders - tạo đơn hàng Shop
  createOrder: (data: {
    userId?: number;
    type?: string;
    shippingAddress: string;
    paymentMethod?: string;
    ticketId?: number;
  }) => {
    const userId = data.userId ?? parseInt(localStorage.getItem('userId') || '0');
    return axiosClient.post('/orders', { type: 'SHOP', paymentMethod: 'COD', ...data, userId });
  },

  // Backend: GET /api/orders?userId=X
  getMyOrders: () => {
    const userId = parseInt(localStorage.getItem('userId') || '0');
    return axiosClient.get(`/orders?userId=${userId}`);
  },

  // Backend: GET /api/orders/{id}
  getOrderById: (id: string | number) => axiosClient.get(`/orders/${id}`),

  // Backend: PUT /api/orders/{id}/cancel
  cancelOrder: (id: string | number) => axiosClient.put(`/orders/${id}/cancel`),

  // Backend: PUT /api/orders/{id}/status
  updateStatus: (id: string | number, status: string) =>
    axiosClient.put(`/orders/${id}/status`, { status }),
};
