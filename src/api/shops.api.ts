import axiosInstance from './axiosInstance';

interface CustomPrice {
  productId: string;
  price: number;
}

export const shopsApi = {
  getAll: () => axiosInstance.get('/shops'),

  create: (data: { name: string; address: string; contactNumber?: string; customPrices?: CustomPrice[] }) =>
    axiosInstance.post('/shops', data),

  update: (id: string, data: { name: string; address: string; contactNumber?: string; customPrices?: CustomPrice[] }) =>
    axiosInstance.put(`/shops/${id}`, data),

  remove: (id: string) => axiosInstance.delete(`/shops/${id}`),

  getHistory: (id: string, params?: Record<string, string>) =>
    axiosInstance.get(`/shops/${id}/history`, { params }),
};
