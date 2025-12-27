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
      hasFetched.current = false;
    }
  };

  const googleLogin = async () => {
    try {
      const {data} = await authAPI.googleLogin();

      if(data && data._id){
        setUser(data);
        return{
          success: true,
          user : data
        }
      }
      else{
        return{
          success: false,
          error : "Failed to fetch user data"
        }
      };
    } catch (error) {
      const message = error.response?.data?.message || "Google authentication failed";
      return { success: false, error: message };
    }
  };

  const initiateGoogleLogin = () => {
    // Auto-detect environment
    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : import.meta.env.VITE_API_URL
    
    console.log('🔵 Redirecting to:', `${backendUrl}/api/auth/google`);
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword: newPassword // Backend expects this
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Password changed successfully'
        };
      }

      return {
        success: false,
        error: 'Failed to change password'
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      setError(message);
      return { success: false, error: message };
    }
  };


  const deleteAccount = async (password, confirmation) => {
    try {
      setError(null);
      const response = await authAPI.deleteAccount({ password, confirmation });

      if (response.data.success) {
        setUser(null);
        socketService.disconnect();
        hasFetched.current = false;
        return {
          success: true,
          message: response.data.message || 'Account deleted successfully'
        };
      }

      return {
        success: false,
        error: 'Failed to delete account'
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Account deletion failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    googleLogin,
    changePassword,
    deleteAccount,
    fetchCurrentUser,
    initiateGoogleLogin,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};