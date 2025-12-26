// src/pages/Home.jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AuthPage from './AuthPage'; // Your existing auth component
import {Activity} from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#6495ED]/20 to-white dark:from-[#6495ED]/20 dark:to-black">
      
      {/* Split Container */}
      <div className="min-h-screen flex flex-col md:flex-row">
        
        {/* LEFT SIDE - Info Section */}
        <div className="md:w-1/2 flex items-center justify-center rounded-lg p-5 md:p-12 ">
          <div className="max-w-lg">
            
            {/* Logo/Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white flex items-center">
              <Activity className='text-4xl text-[#6495ED]'/>
                Music Room
            </h1>
            
            {/* Tagline */}
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Listen to music together in perfect sync
            </p>
            
            {/* Features List */}
            <div className="space-y-4 mb-8">
              <Feature icon="🎵" text="Synchronized playback across all devices" />
              <Feature icon="💬" text="Real-time chat with your friends" />
              <Feature icon="📋" text="Collaborative playlists everyone can add to" />
              <Feature icon="👥" text="See who's online and listening" />
            </div>
            

          </div>
        </div>

        {/* RIGHT SIDE - Auth Section */}
        <div className="md:w-1/2 flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            <AuthPage /> {/* Your existing auth component */}
          </div>
        </div>

      </div>
    </div>
  );
};

// Feature Component
const Feature = ({ icon, text }) => (
  <div className="flex items-center space-x-3">
    <span className="text-2xl icon-float group-hover:sacle-110 transition-transform druation-300">{icon}</span>
    <p className="text-gray-700 dark:text-gray-300">{text}</p>

    <style>{`
        @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }

      .icon-float {
        animation: float 3s ease-in-out infinite;
      }
    `}</style>
  </div>
);

export default Home;