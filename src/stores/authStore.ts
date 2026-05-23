import { create } from 'zustand';
import apiClient from '../lib/axios';
import type { User, AuthResponse } from '../types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  setAuth: (auth: { user: User; accessToken: string | null }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (identifier, password, rememberMe = false) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      identifier,
      password,
      rememberMe,           // backend will use it to set token expiry
    });
    const data = response.data;
    const token = data.accessToken;
    localStorage.setItem('accessToken', token);
    set({
      user: data.user,
      accessToken: token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setAuth: ({ user, accessToken }) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
    set({
      user,
      accessToken,
      isAuthenticated: !!accessToken,
    });
  },
}));