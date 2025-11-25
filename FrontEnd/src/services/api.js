import axios from 'axios';
import store from '../store';
import { logout } from '../store/slices/authSlice';
import { notifyError, notifyWarning } from '../utils/notification';
console.log(process.env.REACT_APP_PROD)
// const production = false;
// const production = process.env.REACT_APP_PROD === "prod";
const production = false;
console.log(production)
const baseURL = production 
    ? 'https://omniedu-server.onrender.com' 
    : 'http://localhost:5003';
console.log(baseURL)
// console.log('process.env.prod', process.env.REACT_APP_PROD);
const api = axios.create({
  baseURL: baseURL,
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
      notifyError('Session expired. Please log in again.');

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
      notifyError('Server error! Please try again later.');
    } else if (status === 404) {
      notifyWarning('Requested resource not found.');
    } else if (!status) {
      notifyError('Network error! Please check your internet connection.');
    } 

    return Promise.reject(error);
  }
);

export default api;
