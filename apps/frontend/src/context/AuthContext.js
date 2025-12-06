import { createContext, useContext, useState, useEffect } from 'react';
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

  // Check if user is logged in on mount
  useEffect(() => {
    // With cookies, we just try to fetch current user
    // If cookie exists, backend will authenticate
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.data.user);
      
      // Connect socket (cookie is sent automatically)
      socketService.connect();
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // User is not authenticated (no cookie or invalid)
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.signup(userData);
      const { user } = response.data.data;
      
      setUser(user);
      
      // Connect socket (cookie is sent automatically)
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
      const { user } = response.data.data;
      
      setUser(user);
      
      // Connect socket (cookie is sent automatically)
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
      await authAPI.logout(); // Backend clears cookie
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      socketService.disconnect();
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
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};