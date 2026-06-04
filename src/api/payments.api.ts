import axiosInstance from './axiosInstance';

export const paymentsApi = {
  create: (data: { shopId: string; amount: number; vehicleId: string }) =>
    axiosInstance.post('/payments', data),
};
