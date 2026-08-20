import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CityInfo, LoginResponseData, UserInfo } from '@/types/auth';

interface AuthState {
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
      user: null,
      isAuthenticated: false,
      availableCities: [],
      currentCity: null,
      requiresCitySelection: false,
      
      setAuth: (session) => {
        localStorage.removeItem('token');
        set({
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
      version: 3,
      migrate: (persistedState, version) => {
        localStorage.removeItem('token');
        if (version < 3) {
          return {
            ...(persistedState as Partial<AuthState>),
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
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        availableCities: state.availableCities,
        currentCity: state.currentCity,
        requiresCitySelection: state.requiresCitySelection,
      }),
    }
  )
);
