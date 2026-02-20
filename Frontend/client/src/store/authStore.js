import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Register
      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await API.post('/auth/register', formData);
          // If backend returns tokens (direct-login registration), store them.
          if (data?.token && data?.refreshToken && data?.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            set({
              user: data.user,
              token: data.token,
              refreshToken: data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success(`Welcome, ${data.user.name}! 👋`);
            return { success: true, data, user: data.user, loggedIn: true };
          }

          set({ isLoading: false });
          return { success: true, data, loggedIn: false };
        } catch (error) {
          set({ isLoading: false });
          const msg = error.response?.data?.message || 'Registration failed';
          toast.error(msg);
          return { success: false, message: msg };
        }
      },

      // Verify email OTP
      verifyEmail: async (userId, otp) => {
        set({ isLoading: true });
        try {
          const { data } = await API.post('/auth/verify-email', { userId, otp });
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success('Email verified! Welcome to Campus Lost & Found!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const msg = error.response?.data?.message || 'OTP verification failed';
          toast.error(msg);
          return { success: false, message: msg };
        }
      },

      // Login
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await API.post('/auth/login', credentials);
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success(`Welcome back, ${data.user.name}! 👋`);
          return { success: true, user: data.user };
        } catch (error) {
          set({ isLoading: false });
          const msg = error.response?.data?.message || 'Login failed';
          return {
            success: false,
            message: msg,
          };
        }
      },

      // Logout
      logout: async () => {
        try {
          await API.post('/auth/logout');
        } catch { /* ignore */ }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        toast.success('Logged out successfully.');
      },

      // Update user in store
      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }));
      },

      // Fetch fresh user data
      refreshUser: async () => {
        try {
          const { data } = await API.get('/auth/me');
          set({ user: data.user });
        } catch { /* ignore */ }
      },
    }),
    {
      name: 'campus-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };
export default useAuthStore;
