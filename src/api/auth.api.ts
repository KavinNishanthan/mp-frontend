import axiosInstance from './axiosInstance';

export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    axiosInstance.post('/users/login', credentials),
};
