import axiosClient from './axiosClient';

export const reviewApi = {
  list: (productId: string | number) =>
    axiosClient.get(`/products/${productId}/reviews`),
  create: (productId: string | number, data: {
    userId: number;
    rating: number;
    comment: string;
    orderId?: number;
  }) => axiosClient.post(`/products/${productId}/reviews${data.orderId ? `?orderId=${data.orderId}` : ''}`, {
    userId: data.userId,
    rating: data.rating,
    comment: data.comment,
  }),
};
