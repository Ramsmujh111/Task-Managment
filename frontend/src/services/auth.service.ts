import apiClient from '@/lib/apiClient';
import { ApiResponse, LoginResponse, User } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string) {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', {
      name, email, password,
    });
    return data;
  },

  async login(email: string, password: string) {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    return data;
  },

  async logout(refreshToken: string) {
    const { data } = await apiClient.post<ApiResponse>('/auth/logout', { refreshToken });
    return data;
  },

  async getProfile() {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string) {
    const { data } = await apiClient.post<ApiResponse>('/auth/reset-password', { token, newPassword });
    return data;
  },
};
