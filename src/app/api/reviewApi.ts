import axiosClient from './axiosClient';

export interface ReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  orderId: number | null;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  productName?: string;
  productImage?: string;
}

export const reviewApi = {
  create: (productId: number, orderId: number, data: ReviewRequest): Promise<{ data: ReviewResponse }> =>
    axiosClient.post(`/products/${productId}/reviews?orderId=${orderId}`, data),

  update: (productId: number, reviewId: number, data: ReviewRequest): Promise<{ data: ReviewResponse }> =>
    axiosClient.put(`/products/${productId}/reviews/${reviewId}`, data),

  remove: (productId: number, reviewId: number): Promise<{ data: string }> =>
    axiosClient.delete(`/products/${productId}/reviews/${reviewId}`),

  listByProduct: (productId: number): Promise<{ data: ReviewResponse[] }> =>
    axiosClient.get(`/products/${productId}/reviews`),

  listAll: (): Promise<{ data: ReviewResponse[] }> =>
    axiosClient.get('/reviews')
};
