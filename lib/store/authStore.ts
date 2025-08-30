"use client";

import { create } from "zustand";
import type { User } from "@/types/user";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  setUser: (user: User) => void;
  clearIsAuthenticated: () => void;
  updateUser: (patch: Partial<User>) => void;
  markChecked: () => void; 
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthChecked: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  clearIsAuthenticated: () => set({ user: null, isAuthenticated: false }),
  updateUser: (patch) =>
    set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
  markChecked: () => set({ isAuthChecked: true }),
}));
