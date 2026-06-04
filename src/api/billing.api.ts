import axiosInstance from './axiosInstance';

export const billingApi = {
  getAll: (params?: Record<string, string>) =>
    axiosInstance.get('/bills', { params }),

  create: (data: {
    shopId: string;
    vehicleId: string;
    items: { productId: string; quantity: number }[];
    paidAmount: number;
  }) => axiosInstance.post('/bills', data),

  update: (
    id: string,
    data: {
      items: { productId: string; quantity: number; sellingPrice: number; costPriceSnapshot: number }[];
      paidAmount: number;
      reason?: string;
    }
  ) => axiosInstance.put(`/bills/${id}`, data),

  remove: (id: string, reason?: string) =>
    axiosInstance.delete(`/bills/${id}`, { data: { reason } }),

  getAuditLog: (id: string) => axiosInstance.get(`/bills/${id}/audit`),
};
