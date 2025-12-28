// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL: Must be true for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    
    // Log if cookies are being sent
    if (document.cookie) {
      console.log('Cookies available:', document.cookie.split(';').length);
    } else {
      console.warn('⚠️ No cookies found in document.cookie');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('API Error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - Cookie might not be sent or expired');
      console.log('Current cookies:', document.cookie);
    }
    
    return Promise.reject(error);
  }
);

export default api;