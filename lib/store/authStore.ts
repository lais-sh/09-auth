"use client";

import { create } from "zustand";
import type { User } from "@/types/user";

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;

  setUser: (user: User) => void;
  clearAuth: () => void;
  updateUser: (patch: Partial<User>) => void;
  markChecked: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthChecked: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
  updateUser: (patch) =>
    set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
  markChecked: () => set({ isAuthChecked: true }),
}));
