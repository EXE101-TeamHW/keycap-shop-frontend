import axiosClient from './axiosClient';
import { Product } from '../data/products'; // fallback type, we will redefine if needed

export const productApi = {
  getAll: (): Promise<{ data: Product[] }> => {
    return axiosClient.get('/products');
  },
  getById: (id: string): Promise<{ data: Product }> => {
    return axiosClient.get(`/products/${id}`);
  }
};
