// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL  || 'http://localhost:5000/api'; // or your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ← CRITICAL: This must be true for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
};

export default api;