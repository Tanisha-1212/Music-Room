import { Activity, Github, Twitter, Instagram, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4 w-fit group">
              <Activity className="w-8 h-8 text-[#6495ED] group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                MusicRoom
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
              Listen to music together, chat with friends, and create amazing playlists in real-time. 🎵✨
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <SocialIcon href="https://twitter.com" icon={Twitter} label="Twitter" />
              <SocialIcon href="https://instagram.com" icon={Instagram} label="Instagram" />
              <SocialIcon href="https://github.com" icon={Github} label="GitHub" />
              <SocialIcon href="mailto:contact@musicroom.com" icon={Mail} label="Email" />
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <FooterLink to="/#features">Features</FooterLink>
              <FooterLink to="/#how-it-works">How it Works</FooterLink>
              <FooterLink to="/explore">Explore Rooms</FooterLink>
              <FooterLink to="/register">Get Started</FooterLink>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            © {currentYear} MusicRoom. Made with <Heart className="w-4 h-4 text-[#6495ED]" fill="currentColor" /> for music lovers.
          </p>
          <div className="flex gap-6">
            <Link 
              to="/privacy" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#6495ED] transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#6495ED] transition-colors"
            >
              Terms
            </Link>
            <Link 
              to="/cookies" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#6495ED] transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer Link Component
const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-gray-600 dark:text-gray-400 hover:text-[#6495ED] transition-colors"
    >
      {children}
    </Link>
  </li>
);

// Social Icon Component
const SocialIcon = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#6495ED] dark:hover:bg-[#6495ED] transition-colors flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-white hover:scale-110 transform"
  >
    <Icon size={20} />
  </a>
);

export default Footer;