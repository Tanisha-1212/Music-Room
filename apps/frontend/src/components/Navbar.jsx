import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Activity, Search, User, LogOut, Sun, Moon, Menu, X, Home, Settings } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropDown, setshowDropDown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-[#6495ED]" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                MusicRoom
              </span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
            <Activity className="w-8 h-8 text-[#6495ED] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              MusicRoom
            </span>
          </Link>

          {/* Right side navigation - Desktop */}
          <div className="hidden z-50 md:flex items-center space-x-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* IF LOGGED IN */}
            {isAuthenticated && (
              <>
                {/* Navigation Links for Authenticated Users */}
                <Link
                  to="/"
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/')
                      ? 'bg-[#6495ED] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="font-medium">Home</span>
                </Link>

                <Link
                  to="/explore"
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/explore')
                      ? 'bg-[#6495ED] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span className="font-medium">Search</span>
                </Link>

                <div className='relative'>
                {/* Profile Button */}
                <button
                  onClick={() => setshowDropDown(!showDropDown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#6495ED] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>

                {showDropDown && (
                  <div className='absolute top-full right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'>
                    {/* User Info */}
                    <div className='px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
                      <p className='text-sm font-medium text-gray-900 dark:text-white '>
                        {user?.username}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu List */}
                    <div className='py-1'>
                      <Link
                        to="/profile"
                        className='flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <User className='w-4 h-4 mr-2'/>
                        Profile
                      </Link>

                      <Link
                        to="/settings"
                        className='flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <Settings className='w-4 h-4 mr-2'/>
                        Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className='w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <LogOut className='w-4 h-4 mr-2'/>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
                </div>
                </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="px-4 py-3 space-y-2">
            {isAuthenticated && (
              <>
                {/* Navigation Links */}
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/')
                      ? 'bg-[#6495ED] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </Link>

                <Link
                  to="/explore"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/explore')
                      ? 'bg-[#6495ED] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Search className="w-5 h-5" />
                  <span className="font-medium">Search</span>
                </Link>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

                {/* Profile Info */}
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#6495ED] flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View Profile
                    </p>
                  </div>
                </Link>


                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
          )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;