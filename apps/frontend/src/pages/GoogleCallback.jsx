// pages/AuthCallbackHandler.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

function AuthCallbackHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchCurrentUser, user, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 AuthCallback: Starting...');
      setDebugInfo('Checking for errors...');
      
      // Check for error from backend
      const authError = searchParams.get('error');
      if (authError === 'auth_failed') {
        console.log('❌ AuthCallback: Auth failed from backend');
        setError('Google authentication failed. Please try again.');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      try {
        setDebugInfo('Waiting for session to establish...');
        console.log('⏳ AuthCallback: Waiting 1 second for cookie to be set...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDebugInfo('Refreshing authentication...');
        console.log('🔄 AuthCallback: Calling fetchCurrentUser...');
        await fetchCurrentUser();
        
        setDebugInfo('Checking authentication status...');
        console.log('🔍 AuthCallback: Waiting for auth state...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ AuthCallback: Complete. User:', user);
        console.log('✅ AuthCallback: isAuthenticated:', isAuthenticated);
        
        setDebugInfo('Redirecting to dashboard...');
        
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
        
      } catch (err) {
        console.error('❌ AuthCallback error:', err);
        setError('Authentication failed. Redirecting to home...');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, fetchCurrentUser]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
      <div className="text-center p-8">
        <Loader2 className="w-12 h-12 text-[#6495ED] animate-spin mx-auto mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Completing authentication...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{debugInfo}</p>
      </div>
    </div>
  );
}

export default AuthCallbackHandler;