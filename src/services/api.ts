import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// API Base URLs - adjust these based on your actual service ports
const API_URLS = {
  users: import.meta.env.VITE_USERS_API_URL || 'http://localhost:5001',
  hotels: import.meta.env.VITE_HOTELS_API_URL || 'http://localhost:5002',
  reservations: import.meta.env.VITE_RESERVATIONS_API_URL || 'http://localhost:5003',
  payments: import.meta.env.VITE_PAYMENTS_API_URL || 'http://localhost:5004',
};

// Create axios instances for each service
const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        console.error('Unauthorized - logging out');
        useAuthStore.getState().logout();
      }
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return Promise.reject(error);
    }
  );

  return instance;
};

// API clients for each service
export const usersApi = createApiInstance(API_URLS.users);
export const hotelsApi = createApiInstance(API_URLS.hotels);
export const reservationsApi = createApiInstance(API_URLS.reservations);
export const paymentsApi = createApiInstance(API_URLS.payments);

// Error handler helper
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>;
    return axiosError.response?.data?.error || axiosError.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};
