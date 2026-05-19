import axiosClient from './axiosClient';

export const cartApi = {
  getCart: () => axiosClient.get('/cart'),
  addItem: (data: { productId: number, quantity: number, options: string }) => axiosClient.post('/cart/items', data),
  removeItem: (itemId: number) => axiosClient.delete(`/cart/items/${itemId}`)
};
