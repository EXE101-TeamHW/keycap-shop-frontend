import axiosClient from './axiosClient';

const getUserId = (): number => {
  return parseInt(localStorage.getItem('userId') || '0');
};

export const cartApi = {
  // Backend: GET /api/cart?userId=X
  getCart: () => axiosClient.get(`/cart?userId=${getUserId()}`),
  // Backend: POST /api/cart/items - body needs userId
  addItem: (data: { productId: number; quantity: number; options?: string }) =>
    axiosClient.post('/cart/items', { userId: getUserId(), productId: data.productId, quantity: data.quantity }),
  // Backend: DELETE /api/cart/items/{id}
  removeItem: (itemId: number) => axiosClient.delete(`/cart/items/${itemId}`),
};
