import axiosInstance from './axiosInstance';

export const vehiclesApi = {
  getAll: () => axiosInstance.get('/vehicles'),

  create: (data: { registrationNumber: string; name?: string }) =>
    axiosInstance.post('/vehicles', data),

  update: (id: string, data: { registrationNumber: string; name?: string }) =>
    axiosInstance.put(`/vehicles/${id}`, data),

  assign: (id: string, driverId: string | null) =>
    axiosInstance.put(`/vehicles/${id}/assign`, { driverId }),

  remove: (id: string) => axiosInstance.delete(`/vehicles/${id}`),
};
