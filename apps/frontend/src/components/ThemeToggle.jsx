import {Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
// Theme Toggle Button
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full bg-linear-to-r from-purple-400 to-pink-400 dark:from-purple-500 dark:to-pink-500 text-white hover:shadow-lg transition-all transform hover:scale-110 active:scale-95"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
