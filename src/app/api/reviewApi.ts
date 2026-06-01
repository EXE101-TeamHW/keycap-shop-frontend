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
}

export const reviewApi = {
  create: (productId: number, orderId: number, data: ReviewRequest): Promise<{ data: ReviewResponse }> =>
    axiosClient.post(`/products/${productId}/reviews?orderId=${orderId}`, data),

  listByProduct: (productId: number): Promise<{ data: ReviewResponse[] }> =>
    axiosClient.get(`/products/${productId}/reviews`),

  listAll: (): Promise<{ data: ReviewResponse[] }> =>
    axiosClient.get('/reviews')
};
