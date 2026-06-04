import axiosClient from './axiosClient';

export const cartApi = {
  // Backend: GET /api/cart
  getCart: () => axiosClient.get(`/cart`),
  // Backend: POST /api/cart/items
  addItem: (data: { productId: number; quantity: number; options?: string }) =>
    axiosClient.post('/cart/items', { productId: data.productId, quantity: data.quantity }),
  // Backend: PUT /api/cart/items/{id}
  updateQuantity: (itemId: number, quantity: number) =>
    axiosClient.put(`/cart/items/${itemId}`, { quantity }),
  // Backend: DELETE /api/cart/items/{id}
  removeItem: (itemId: number) => axiosClient.delete(`/cart/items/${itemId}`),
};
