import { Music, Users, MessageCircle, Sparkles, Play, Heart, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="text-center pt-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Floating Music Notes Decoration */}
          <div className="relative">
            <div className="absolute -top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s' }}>🎵</div>
            <div className="absolute -top-5 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎶</div>
            <div className="absolute top-10 right-10 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 dark:from-blue-300 dark:via-pink-300 dark:to-yellow-300 bg-clip-text text-transparent leading-tight">
            Listen Together,
            <br />
            Vibe Together
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Create rooms, share music, chat with friends and enjoy synchronized listening experiences 🎧✨
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <Play size={24} />
              Get Started Free
            </Link>
            <Link
              to="/explore"
              className="px-8 py-4 rounded-full border-2 border-blue-400 dark:border-blue-300 text-blue-600 dark:text-blue-300 font-bold text-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
            >
              Explore Rooms
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-12">
            <StatCard number="10K+" label="Active Users" icon="👥" />
            <StatCard number="5K+" label="Rooms Created" icon="🎵" />
            <StatCard number="1M+" label="Songs Played" icon="🎶" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-800 dark:text-slate-200">
            Why MusicRoom? ✨
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 text-lg mb-16">
            Everything you need to enjoy music with friends
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Music className="text-blue-500 dark:text-blue-400" size={40} />}
              title="Create Rooms"
              description="Start your own music room instantly. Invite friends, set the mood, and control the playlist together."
              emoji="🎵"
              color="blue"
            />
            <FeatureCard
              icon={<MessageCircle className="text-pink-500 dark:text-pink-400" size={40} />}
              title="Real-time Chat"
              description="Chat while you listen. React to songs, share thoughts, and connect through music in real-time."
              emoji="💬"
              color="pink"
            />
            <FeatureCard
              icon={<Users className="text-yellow-500 dark:text-yellow-400" size={40} />}
              title="Collaborative Playlists"
              description="Build playlists together. Everyone can add songs, vote on tracks, and create the perfect vibe."
              emoji="👥"
              color="yellow"
            />
            <FeatureCard
              icon={<Headphones className="text-pink-500 dark:text-pink-400" size={40} />}
              title="Synced Playback"
              description="Perfect synchronization. Everyone hears the same thing at the same time, no matter where they are."
              emoji="🎧"
              color="pink"
            />
            <FeatureCard
              icon={<Heart className="text-blue-500 dark:text-blue-400" size={40} />}
              title="Discover Music"
              description="Find new favorites. Explore what others are listening to and discover tracks you'll love."
              emoji="❤️"
              color="blue"
            />
            <FeatureCard
              icon={<Sparkles className="text-yellow-500 dark:text-yellow-400" size={40} />}
              title="Free Forever"
              description="No subscriptions, no limits. Create unlimited rooms and enjoy music with friends, completely free."
              emoji="✨"
              color="yellow"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-800 dark:text-slate-200">
            How It Works 🚀
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 text-lg mb-16">
            Get started in three simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Create a Room"
              description="Sign up and create your first music room. Give it a cool name and set the vibe!"
              emoji="🎨"
              color="blue"
            />
            <StepCard
              number="2"
              title="Invite Friends"
              description="Share the room link with friends. They can join instantly and start listening together."
              emoji="📲"
              color="pink"
            />
            <StepCard
              number="3"
              title="Enjoy Together"
              description="Play music, chat, and create unforgettable moments with your crew!"
              emoji="🎉"
              color="yellow"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-300 via-pink-300 to-yellow-300 dark:from-blue-400 dark:via-pink-400 dark:to-yellow-400 p-12 text-center">
            {/* Decorative elements */}
            <div className="absolute top-5 left-10 text-4xl opacity-40">🎵</div>
            <div className="absolute bottom-5 right-10 text-4xl opacity-40">🎶</div>
            <div className="absolute top-1/2 left-5 text-3xl opacity-30">✨</div>
            <div className="absolute top-1/2 right-5 text-3xl opacity-30">💫</div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4 relative z-10 text-slate-800">
              Ready to Start Vibing? 🎧
            </h2>
            <p className="text-xl mb-8 opacity-80 relative z-10 text-slate-700">
              Join thousands of music lovers already enjoying synchronized listening
            </p>
            <Link
              to="/register"
              className="inline-block px-10 py-4 rounded-full bg-white text-blue-600 font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all relative z-10"
            >
              Create Your First Room 🚀
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ number, label, icon }) => (
  <div className="text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 dark:from-blue-300 dark:via-pink-300 dark:to-yellow-300 bg-clip-text text-transparent">
      {number}
    </div>
    <div className="text-slate-600 dark:text-slate-400 font-semibold">{label}</div>
  </div>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, emoji, color }) => {
  const colorClasses = {
    blue: 'border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    pink: 'border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
    yellow: 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20'
  };

  return (
    <div className={`group p-8 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 transition-all hover:scale-105 hover:shadow-xl ${colorClasses[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30' : color === 'pink' ? 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30' : 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30'}`}>
          {icon}
        </div>
        <span className="text-3xl">{emoji}</span>
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

// Step Card Component
const StepCard = ({ number, title, description, emoji, color }) => {
  const bgClasses = {
    blue: 'bg-gradient-to-br from-blue-400 to-blue-500',
    pink: 'bg-gradient-to-br from-pink-400 to-pink-500',
    yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-500'
  };

  const borderClasses = {
    blue: 'border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-500',
    pink: 'border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-500',
    yellow: 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-500'
  };

  return (
    <div className="relative">
      <div className={`absolute -top-6 -left-6 w-16 h-16 rounded-full ${bgClasses[color]} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
        {number}
      </div>
      <div className={`pt-8 p-8 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 transition-all ${borderClasses[color]}`}>
        <div className="text-4xl mb-4">{emoji}</div>
        <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default LandingPage;