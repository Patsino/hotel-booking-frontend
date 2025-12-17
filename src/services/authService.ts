import { usersApi } from './api';
import type { LoginCredentials, RegisterCredentials, LoginResponse, RegisterResponse } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await usersApi.post<LoginResponse>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await usersApi.post<RegisterResponse>('/api/auth/register', credentials);
    return response.data;
  },

  becomeHotelOwner: async (): Promise<LoginResponse> => {
    const response = await usersApi.post<LoginResponse>('/api/auth/become-hotel-owner');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await usersApi.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
