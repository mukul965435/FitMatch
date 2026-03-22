import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosInstance from '../utils/axios'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await axiosInstance.post('/auth/register', { name, email, password })
          set({ user: data.data, token: data.data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed'
          set({ error: msg, isLoading: false })
          return { success: false, message: msg }
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await axiosInstance.post('/auth/login', { email, password })
          set({ user: data.data, token: data.data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed'
          set({ error: msg, isLoading: false })
          return { success: false, message: msg }
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout')
        } catch (e) {
          // ignore
        }
        set({ user: null, token: null })
      },

      updateUser: (updatedData) => {
        set((state) => ({ user: { ...state.user, ...updatedData } }))
      },

      refreshUser: async () => {
        try {
          const { data } = await axiosInstance.get('/auth/me')
          set({ user: data.data })
        } catch (e) {
          // ignore
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'fitmatch-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export default useAuthStore
