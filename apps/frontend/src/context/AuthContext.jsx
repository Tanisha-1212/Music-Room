// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  const fetchCurrentUser = async () => {
    // Prevent multiple simultaneous calls
    if (hasFetched.current) {
      return;
    }
    
    hasFetched.current = true;

    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      
      if (!isMounted.current) return;
      
      const userData = response.data.data.user;
      setUser(userData);
      socketService.connect();
    } catch (error) {
      if (!isMounted.current) return;
      
      // Only log non-401 errors (401 is expected when not logged in)
      if (error.response?.status !== 401) {
        console.error('Auth error:', error);
      }
      setUser(null);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchCurrentUser();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.signup(userData);
      const user = response.data.data.user;
      setUser(user);
      socketService.connect();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const user = response.data.data.user;
      setUser(user);
      socketService.connect();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      const message = error.response?.data?.message || 'Logout failed';
      setError(message);
    } finally {
      setUser(null);
      socketService.disconnect();
      // Reset the fetch flag so user can log back in
      hasFetched.current = false;
    }
  };

  const googleLogin = () => {
    authAPI.googleLogin();
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    googleLogin,
    fetchCurrentUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};