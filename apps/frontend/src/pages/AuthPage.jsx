import { useState, useEffect } from 'react';
import { Mail, Lock, User, Music } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  
  // Determine active tab based on route
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/register' ? 'signup' : 'login'
  );
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Update tab when route changes
  useEffect(() => {
    setActiveTab(location.pathname === '/register' ? 'signup' : 'login');
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (activeTab === 'signup' && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (activeTab === 'signup' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (activeTab === 'login') {
        const result = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (result.success) {
          navigate('/');
        } else {
          setErrors({ submit: result.error });
        }
      } else {
        const result = await signup({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        if (result.success) {
          navigate('/');
        } else {
          setErrors({ submit: result.error });
        }
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Integrate with your Google OAuth
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Single unified card with gradient background */}
      <div className="w-full max-w-6xl rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          
          {/* Left Side - Illustration */}
          <div className="flex flex-col justify-center items-center p-12 text-white relative">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 text-6xl opacity-30 animate-bounce">🎵</div>
            <div className="absolute bottom-10 right-10 text-6xl opacity-30 animate-bounce" style={{ animationDelay: '0.3s' }}>🎶</div>
            <div className="absolute top-1/2 right-10 text-4xl opacity-20">✨</div>
            <div className="absolute bottom-20 left-10 text-4xl opacity-20">💫</div>
            
            <div className="relative z-10 text-center space-y-6">
              <div className="text-8xl mb-4">🎧</div>
              <h2 className="text-4xl font-bold">Welcome to MusicRoom</h2>
              <p className="text-xl opacity-90">
                Create rooms, share music, and vibe with friends in real-time
              </p>
              <div className="flex justify-center gap-4 pt-6">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">🎵</div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">💬</div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">👥</div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form with subtle backdrop */}
          <div className="flex items-center justify-center p-8 lg:p-12 bg-white/10 dark:bg-black/10 backdrop-blur-md">
            <div className="w-full max-w-md">
              
              {/* Logo for mobile */}
              <div className="lg:hidden flex justify-center mb-6">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Music className="text-white" size={32} />
                </div>
              </div>

              {/* Sliding Tabs */}
              <div className="relative mb-8">
                <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1">
                  <button
                    onClick={() => handleTabChange('login')}
                    className={`flex-1 py-3 rounded-full font-semibold transition-all ${
                      activeTab === 'login'
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'text-white'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleTabChange('signup')}
                    className={`flex-1 py-3 rounded-full font-semibold transition-all ${
                      activeTab === 'signup'
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="mb-4 p-3 rounded-2xl bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-white text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                
                {/* Username field (for signup) */}
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border-2 ${
                          errors.username ? 'border-red-400' : 'border-white/30'
                        } focus:border-white focus:bg-white/30 focus:outline-none transition-all text-white placeholder:text-white/60`}
                      />
                    </div>
                    {errors.username && <p className="mt-1 text-sm text-red-200">{errors.username}</p>}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border-2 ${
                        errors.email ? 'border-red-400' : 'border-white/30'
                      } focus:border-white focus:bg-white/30 focus:outline-none transition-all text-white placeholder:text-white/60`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-200">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border-2 ${
                        errors.password ? 'border-red-400' : 'border-white/30'
                      } focus:border-white focus:bg-white/30 focus:outline-none transition-all text-white placeholder:text-white/60`}
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-200">{errors.password}</p>}
                </div>

                {/* Confirm Password (for signup) */}
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border-2 ${
                          errors.confirmPassword ? 'border-red-400' : 'border-white/30'
                        } focus:border-white focus:bg-white/30 focus:outline-none transition-all text-white placeholder:text-white/60`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-200">{errors.confirmPassword}</p>}
                  </div>
                )}

                {/* Forgot Password (for login) */}
                {activeTab === 'login' && (
                  <div className="text-right">
                    <button className="text-sm text-white hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-white text-purple-600 font-bold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Please wait...' : activeTab === 'login' ? 'Login' : 'Sign Up'}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3 rounded-full bg-white text-slate-700 font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;