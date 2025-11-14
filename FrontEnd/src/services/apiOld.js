import axios from 'axios';
import store from '../store';
import { logout } from '../store/slices/authSlice';
import { toast } from 'react-toastify'; // Make sure you've installed react-toastify

const production = false;

const api = axios.create({
  baseURL: production 
    ? 'https://omniedu-server.onrender.com' 
    : 'http://localhost:5003',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Prevent multiple redirects on 401 bursts
let isHandling401 = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;
    const url = (originalRequest?.url || '').toLowerCase();

    const state = store.getState();
    const isAuthed = Boolean(state?.auth?.isAuthenticated);

    // Skip handling for auth endpoints so Login page shows its own errors
    const isAuthLogin = url.includes('/auth/login');
    const isAuthCheck = url.includes('/auth/checkauth');
    const isLogoutCall = url.includes('/auth/logout');

    // Handle 401 Unauthorized
    if (status === 401) {
      if (isAuthLogin || isAuthCheck || isLogoutCall) {
        return Promise.reject(error);
      }

      if (!isAuthed) {
        return Promise.reject(error);
      }

      if (isHandling401) {
        return Promise.reject(error);
      }

      isHandling401 = true;
      toast.error('Session expired. Please log in again.');

      try {
        store.dispatch(logout());
        localStorage.removeItem('authState');
        localStorage.removeItem('token');
      } catch (_) {}

      // Redirect user to login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500); // give time for toast to appear
      }

      // Reset flag to allow future handling
      setTimeout(() => {
        isHandling401 = false;
      }, 500);

      return Promise.reject(error);
    }

    // Handle other errors gracefully
    if (status >= 500) {
      toast.error('Server error! Please try again later.');
    } else if (status === 404) {
      toast.warning('Requested resource not found.');
    } else if (!status) {
      toast.error('Network error! Please check your internet connection.');
    } else {
      toast.error('Something went wrong! Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api;
