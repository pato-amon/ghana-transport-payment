// frontend/src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setUser: (user) => set({
                user,
                isAuthenticated: true,
            }),

            setToken: (token) => set({ token }),

            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false,
            }),

            updateBalance: (newBalance) => set((state) => ({
                user: { ...state.user, walletBalance: newBalance }
            })),

            updateUser: (updates) => set((state) => ({
                user: { ...state.user, ...updates }
            })),
        }),
        {
            name: 'transportgh-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;