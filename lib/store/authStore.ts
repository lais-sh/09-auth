'use client';

import { create } from 'zustand';
import type { User } from '@/types/user';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearIsAuthenticated: () => void;
  updateUser: (patch: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  clearIsAuthenticated: () => set({ user: null, isAuthenticated: false }),

  updateUser: (patch) =>
    set((state) =>
      state.user ? { user: { ...state.user, ...patch } } : state
    ),
}));
