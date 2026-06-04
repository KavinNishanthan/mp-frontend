import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getStats: () => axiosInstance.get('/dashboard/stats'),

  getReports: (params?: Record<string, string>) =>
    axiosInstance.get('/dashboard/reports', { params }),

  getVehicleHistory: (vehicleId: string, params?: Record<string, string>) =>
    axiosInstance.get(`/dashboard/vehicle-history/${vehicleId}`, { params }),
};
