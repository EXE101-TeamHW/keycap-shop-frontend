import axiosClient from './axiosClient';

export const paymentApi = {
  createPayosLink: (data: { orderId: number }) => 
    axiosClient.post('/payments/payos/create-payment', data),
  handleReturn: (params: Record<string, string>) =>
    axiosClient.get('/payments/payos/return', { params }),
};
