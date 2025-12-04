import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Método para verificar autenticación actual
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem('user')) || null;
      } catch {
        return null;
      }
    })();
    
    set({
      user,
      token,
      isAuthenticated: !!token
    });
    
    return !!token;
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
        token: null
      });
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  updateProfile: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.put('/auth/profile', userData);
      const user = response.data.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      set({
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Password change failed';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;