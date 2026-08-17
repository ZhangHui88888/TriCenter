import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CityInfo, LoginResponseData, UserInfo } from '@/types/auth';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  availableCities: CityInfo[];
  currentCity: CityInfo | null;
  requiresCitySelection: boolean;
  setAuth: (session: LoginResponseData) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<UserInfo>) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      availableCities: [],
      currentCity: null,
      requiresCitySelection: false,
      
      setAuth: (session) => {
        localStorage.setItem('token', session.token);
        set({
          token: session.token,
          user: session.user,
          availableCities: session.availableCities || [],
          currentCity: session.currentCity || null,
          requiresCitySelection: session.requiresCitySelection,
          isAuthenticated: true,
        });
      },
      
      clearAuth: () => {
        localStorage.removeItem('token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          availableCities: [],
          currentCity: null,
          requiresCitySelection: false,
        });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      hasPermission: (permission) => {
        return get().user?.permissions?.includes(permission) ?? false;
      },
    }),
    {
      name: 'auth-storage',
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          return {
            ...(persistedState as Partial<AuthState>),
            token: null,
            user: null,
            isAuthenticated: false,
            availableCities: [],
            currentCity: null,
            requiresCitySelection: false,
          } as AuthState;
        }
        return persistedState as AuthState;
      },
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        availableCities: state.availableCities,
        currentCity: state.currentCity,
        requiresCitySelection: state.requiresCitySelection,
      }),
    }
  )
);
