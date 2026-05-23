import apiClient from '../../lib/axios';
import type { User, AuthResponse } from '../../types';

export const authService = {
  login: async (identifier: string, password: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      identifier,
      password,
    });
    return response.data;
  },

  register: async (userData: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    role: string;
  }) => {
    const response = await apiClient.post<{ message: string }>('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  verifyEmail: async (email: string, code: string) => {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', { email, code });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};