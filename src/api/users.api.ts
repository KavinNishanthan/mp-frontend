import axiosInstance from './axiosInstance';

export const usersApi = {
  getAll: () => axiosInstance.get('/users'),

  create: (data: { name: string; username: string; password: string; role: 'admin' | 'driver' }) =>
    axiosInstance.post('/users', data),

  update: (id: string, data: { name: string; username: string; password?: string; role: 'admin' | 'driver' }) =>
    axiosInstance.put(`/users/${id}`, data),

  remove: (id: string) => axiosInstance.delete(`/users/${id}`),
};
