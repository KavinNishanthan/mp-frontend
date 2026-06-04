import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'admin' | 'driver';

interface User {
  _id: string;
  name: string;
  username: string;
  role: Role;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      login: (userData) =>
        set({
          user: userData,
          token: userData.token,
          role: userData.role,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'mp-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
