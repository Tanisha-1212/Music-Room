// src/pages/GoogleCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchCurrentUser } = useAuth();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params
        const errorParam = searchParams.get('error');
        if (errorParam) {
          console.error('Google auth error:', errorParam);
          setError('Google authentication failed. Please try again.');
          setIsProcessing(false);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Check if token is set in cookie (backend should set this)
        console.log('Google callback received, fetching user...');
        
        // Wait a moment for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch the current user to update auth state
        await fetchCurrentUser();
        
        // Navigate to dashboard
        console.log('User authenticated, navigating to dashboard...');
        navigate('/dashboard');
        
      } catch (err) {
        console.error('Callback error:', err);
        setError('Failed to complete authentication. Redirecting...');
        setIsProcessing(false);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, fetchCurrentUser]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {isProcessing ? (
          <>
            <Loader2 className="w-16 h-16 text-[#6495ED] animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Completing Sign In...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we finish setting up your account
            </p>
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to home page...
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default GoogleCallback;