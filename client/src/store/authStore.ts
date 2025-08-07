import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../api/auth";    // axios instance with interceptor
import type { User } from "../api/auth";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        // store state
        set({ token, user });
        // install header for future requests
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      },
      clearAuth: () => {
        set({ token: null, user: null });
        delete api.defaults.headers.common.Authorization;
      },
    }),
    {
      name: "auth-storage",
      // when rehydrating from localStorage, reinstate the header
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common.Authorization = `Bearer ${state.token}`;
        }
      },
    }
  )
);
