import axiosInstance from './axiosInstance';

export const productsApi = {
  getAll: () => axiosInstance.get('/products'),

  create: (data: { name: string; costPrice: number; defaultSellingPrice: number; unit: string }) =>
    axiosInstance.post('/products', data),

  update: (id: string, data: { name: string; costPrice: number; defaultSellingPrice: number; unit: string }) =>
    axiosInstance.put(`/products/${id}`, data),

  remove: (id: string) => axiosInstance.delete(`/products/${id}`),
};
