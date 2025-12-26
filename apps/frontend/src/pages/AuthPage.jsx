import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';

const AuthPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  
  // Determine initial mode based on URL path
  const isRegisterRoute = location.pathname === '/register';
  const [isLogin, setIsLogin] = useState(!isRegisterRoute);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Update mode when URL changes
  useEffect(() => {
    const shouldBeLogin = location.pathname !== '/register';
    setIsLogin(shouldBeLogin);
    // Clear form when switching modes
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setFieldErrors({});
  }, [location.pathname]);

  // Handle Google OAuth callback
  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError === 'auth_failed') {
      setError('Google authentication failed. Please try again.');
    }
  }, [searchParams, navigate]);

  // Sanitize error messages
  const sanitizeError = (backendError) => {
    console.error('Backend error:', backendError);
    const errorMessage = backendError?.toLowerCase() || '';

    if (errorMessage.includes('invalid') || errorMessage.includes('incorrect')) {
      return isLogin 
        ? 'Invalid email or password. Please try again.' 
        : 'Invalid information provided. Please check your details.';
    }
    if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
      return 'No account found with this email address.';
    }
    if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (errorMessage.includes('username') && errorMessage.includes('taken')) {
      return 'This username is already taken. Please choose another.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('failed to fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    return isLogin 
      ? 'Unable to sign in. Please check your credentials and try again.'
      : 'Unable to create account. Please check your information and try again.';
  };

  // Real-time validation
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    switch (name) {
      case 'username':
        if (!isLogin) {
          if (value.length < 3) {
            errors.username = 'Username must be at least 3 characters';
          } else if (value.length > 20) {
            errors.username = 'Username must be less than 20 characters';
          } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            errors.username = 'Username can only contain letters, numbers, and underscores';
          } else {
            delete errors.username;
          }
        }
        break;

      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

      case 'password':
        if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else if (value.length > 50) {
          errors.password = 'Password must be less than 50 characters';
        } else {
          delete errors.password;
        }
        if (!isLogin && formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else if (!isLogin && formData.confirmPassword) {
          delete errors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!isLogin && value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (value) {
      validateField(name, value);
    } else {
      const errors = { ...fieldErrors };
      delete errors[name];
      setFieldErrors(errors);
    }
    
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { username, email, password, confirmPassword } = formData;
    
    if (isLogin) {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
    } else {
      if (!username || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      setError('Please fix all errors before submitting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      
      if (isLogin) {
        result = await login({email, password});
      } else {
        result = await signup({username, email, password});
      }
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        const userFriendlyError = sanitizeError(result.error);
        setError(userFriendlyError);
      }
    } catch (err) {
      console.error(`${isLogin ? 'Login' : 'Registration'} error:`, err);
      const userFriendlyError = sanitizeError(err.message || err.toString());
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 rounded-4xl">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Toggle Tabs */}
          <div className="grid grid-cols-2 gap-0 p-2 bg-gray-50 dark:bg-gray-900">
            <Link
              to="/login"
              className={`py-3 rounded-lg font-semibold transition-all text-center ${
                isLogin
                  ? 'bg-white dark:bg-gray-800 text-[#6495ED]  shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={`py-3 rounded-lg font-semibold transition-all text-center ${
                !isLogin
                  ? 'bg-white dark:bg-gray-800 text-[#6495ED] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Sign Up
            </Link>
          </div>

          {/* Form Container */}
          <div className="p-8">
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start space-x-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Google Login Button */}
            <div className="mb-6">
              <GoogleAuthButton />
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username Field (Register only) */}
              {!isLogin && (
                <div className="animate-slide-in">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        fieldErrors.username 
                          ? 'border-red-500 focus:ring-red-500' 
                          : formData.username && !fieldErrors.username
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                      placeholder="johndoe"
                      required={!isLogin}
                    />
                    {formData.username && !fieldErrors.username && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {fieldErrors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.username}</p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className={!isLogin ? 'animate-slide-in' : ''}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      fieldErrors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : formData.email && !fieldErrors.email
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="john@example.com"
                    required
                  />
                  {formData.email && !fieldErrors.email && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className={!isLogin ? 'animate-slide-in' : ''}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      fieldErrors.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : formData.password && !fieldErrors.password
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
                )}
                {!isLogin && !fieldErrors.password && formData.password && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Password strength: {formData.password.length >= 8 ? 'Strong' : 'Moderate'}
                  </p>
                )}
              </div>

              {/* Confirm Password Field (Register only) */}
              {!isLogin && (
                <div className="animate-slide-in">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                        fieldErrors.confirmPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : formData.confirmPassword && !fieldErrors.confirmPassword
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Forgot Password (Login only) */}
              {isLogin && (
                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#6495ED] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || Object.keys(fieldErrors).length > 0}
                className="w-full flex items-center justify-center px-6 py-3 rounded-lg bg-[#6495ED] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Terms (Register only) */}
        {!isLogin && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-[#6495ED] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-[#6495ED] hover:underline">
              Privacy Policy
            </Link>
          </p>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;