import axiosInstance from './axiosInstance';

export const stockApi = {
  getWarehouse: () => axiosInstance.get('/stock', { params: { location: 'warehouse' } }),

  getVehicle: (vehicleId: string) =>
    axiosInstance.get('/stock', { params: { location: 'vehicle', vehicleId } }),

  transfer: (data: {
    type: string;
    vehicleId?: string;
    items: { productId: string; quantity: number }[];
    description?: string;
  }) => axiosInstance.post('/stock/transfer', data),
};
