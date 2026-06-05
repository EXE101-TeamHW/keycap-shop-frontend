import axiosClient from './axiosClient';

export const ticketApi = {
  getAll: () => axiosClient.get('/tickets'),
  getById: (id: string) => axiosClient.get(`/tickets/${id}`),
  updateStatus: (id: string, status: string) => axiosClient.put(`/tickets/${id}/status`, { status }),
  updateQuotePrice: (id: string, quotedPrice: number) => axiosClient.put(`/tickets/${id}/quote-price`, { quotedPrice }),
  createCustomOrder: (id: string) => axiosClient.post(`/tickets/${id}/create-order`),
  assignStaff: (id: string, data: any) => axiosClient.put(`/tickets/${id}/assign`, data),
  createMockup: (id: string, payload: any) => axiosClient.post(`/tickets/${id}/mockups`, payload)
};
