"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/api";
import { authApi } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (usernameOrEmail: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (usernameOrEmail, password) => {
        const tokens = await authApi.login({
          username_or_email: usernameOrEmail,
          password,
        });
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);

        const user = await authApi.getCurrentUser();
        set({ user, isAuthenticated: true });
      },

      signup: async (email, username, password) => {
        const tokens = await authApi.signup({ email, username, password });
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);

        const user = await authApi.getCurrentUser();
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore
        } finally {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          set({ user: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
          set({ isLoading: false });
          return;
        }
        try {
          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "wazz-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
