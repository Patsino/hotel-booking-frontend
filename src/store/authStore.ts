import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: number | null;
  email: string | null;
  role: 'User' | 'HotelOwner' | 'Admin' | null;
  isAuthenticated: boolean;
  setAuth: (data: {
    token: string;
    refreshToken: string;
    userId: number;
    email: string;
    role: 'User' | 'HotelOwner' | 'Admin';
  }) => void;
  logout: () => void;
  updateRole: (role: 'User' | 'HotelOwner' | 'Admin') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      userId: null,
      email: null,
      role: null,
      isAuthenticated: false,
      setAuth: (data) =>
        set({
          token: data.token,
          refreshToken: data.refreshToken,
          userId: data.userId,
          email: data.email,
          role: data.role,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          userId: null,
          email: null,
          role: null,
          isAuthenticated: false,
        }),
      updateRole: (role) => set({ role }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
