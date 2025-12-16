import { useState, useEffect } from 'react';
import { Music, Plus, Users, Search, Lock, MoreVertical, Play, Pause, LogIn, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'created', 'joined'
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock user (replace with actual user from useAuth)
  const user = {
    username: 'Alex',
    id: '123'
  };

  // Mock data - Replace with actual API call
  useEffect(() => {
    // TODO: Fetch rooms from API
    // GET /api/rooms?userId={user.id}
    setTimeout(() => {
      setRooms([
        {
          _id: '1',
          name: 'Chill Vibes 🌙',
          roomCode: 'ABC123',
          creator: { _id: '123', username: 'Alex' },
          members: ['123', '456', '789', '101', '102'],
          playlist: [
            { _id: 's1', title: 'Lofi Study Beats', artist: 'ChillHop', thumbnail: '' }
          ],
          currentSong: 's1',
          isPlaying: true,
          isPrivate: false,
          createdAt: new Date()
        },
        {
          _id: '2',
          name: 'Party Time 🎉',
          roomCode: 'XYZ789',
          creator: { _id: '456', username: 'Sarah' },
          members: ['123', '456'],
          playlist: [],
          currentSong: null,
          isPlaying: false,
          isPrivate: false,
          createdAt: new Date()
        },
        {
          _id: '3',
          name: 'Study Session 📚',
          roomCode: 'STU999',
          creator: { _id: '123', username: 'Alex' },
          members: ['123', '789'],
          playlist: [
            { _id: 's2', title: 'Piano Concerto', artist: 'Classical', thumbnail: '' }
          ],
          currentSong: 's2',
          isPlaying: true,
          isPrivate: true,
          createdAt: new Date()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate stats
  const myCreatedRooms = rooms.filter(r => r.creator._id === user.id);
  const activeRooms = rooms.filter(r => r.isPlaying);
  const totalMembers = rooms.reduce((sum, r) => sum + r.members.length, 0);

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterActive === 'active') {
      return matchesSearch && room.isPlaying;
    } else if (filterActive === 'created') {
      return matchesSearch && room.creator._id === user.id;
    } else if (filterActive === 'joined') {
      return matchesSearch && room.creator._id !== user.id;
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="relative inline-block">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Welcome back, {user.username}! 👋
          </h1>
          <div className="absolute -top-8 -right-8 text-4xl animate-bounce">🎵</div>
          <div className="absolute -bottom-4 -left-8 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
        </div>
        
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Ready to vibe with your friends?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus size={24} />
            Create Room
          </button>
          <Link
            to="/explore"
            className="px-8 py-4 rounded-full border-2 border-purple-500 dark:border-purple-400 text-purple-600 dark:text-purple-300 font-bold text-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all flex items-center gap-2"
          >
            <Search size={24} />
            Explore Rooms
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-6">
          <StatCard
            icon={<Music size={32} className="text-purple-600 dark:text-purple-400" />}
            number={myCreatedRooms.length}
            label="Your Rooms"
          />
          <StatCard
            icon={<Play size={32} className="text-pink-600 dark:text-pink-400" />}
            number={activeRooms.length}
            label="Active Now"
          />
          <StatCard
            icon={<Users size={32} className="text-blue-600 dark:text-blue-400" />}
            number={totalMembers}
            label="Total Members"
          />
        </div>
      </section>

      {/* Search and Filter */}
      <section className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border-2 border-purple-200 dark:border-purple-900 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto">
            <FilterButton active={filterActive === 'all'} onClick={() => setFilterActive('all')}>
              All
            </FilterButton>
            <FilterButton active={filterActive === 'active'} onClick={() => setFilterActive('active')}>
              Active
            </FilterButton>
            <FilterButton active={filterActive === 'created'} onClick={() => setFilterActive('created')}>
              Created
            </FilterButton>
            <FilterButton active={filterActive === 'joined'} onClick={() => setFilterActive('joined')}>
              Joined
            </FilterButton>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            {filterActive === 'all' && `All Rooms (${filteredRooms.length})`}
            {filterActive === 'active' && `Active Rooms (${filteredRooms.length})`}
            {filterActive === 'created' && `Your Rooms (${filteredRooms.length})`}
            {filterActive === 'joined' && `Joined Rooms (${filteredRooms.length})`}
          </h2>
        </div>

        {filteredRooms.length === 0 ? (
          <EmptyState 
            message={searchQuery ? "No rooms match your search" : "No rooms found"}
            onCreateRoom={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                isOwner={room.creator._id === user.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, number, label }) => (
  <div className="p-6 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:scale-105">
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 rounded-2xl bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
        {icon}
      </div>
      <div className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
        {label}
      </div>
    </div>
  </div>
);

// Filter Button Component
const FilterButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
      active
        ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg'
        : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-2 border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-500'
    }`}
  >
    {children}
  </button>
);

// Room Card Component
const RoomCard = ({ room, isOwner }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const currentSongData = room.playlist.find(s => s._id === room.currentSong);

  return (
    <div className="group p-6 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:scale-105 hover:shadow-xl relative">
      
      {/* Room Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {room.name}
            </h3>
            {room.isPrivate && (
              <Lock size={16} className="text-slate-500" />
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Code: {room.roomCode}
          </p>
        </div>

        {/* Menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <MoreVertical size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-900 shadow-xl z-10 overflow-hidden">
                <button className="w-full px-4 py-3 text-left hover:bg-purple-100 dark:hover:bg-purple-900/30 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Pencil size={16} />
                  Edit Room
                </button>
                <button className="w-full px-4 py-3 text-left hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Trash2 size={16} />
                  Delete Room
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Album Art / Status */}
      <div className="w-full aspect-square rounded-2xl bg-linear-to-br from-purple-300 to-pink-300 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center mb-4 relative overflow-hidden">
        <Music size={48} className="text-white" />
        
        {/* Playing Animation */}
        {room.isPlaying && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>

      {/* Current Song */}
      {currentSongData ? (
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
            {currentSongData.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {currentSongData.artist}
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          No song playing
        </p>
      )}

      {/* Room Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Users size={16} />
          <span>{room.members.length} members</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Music size={16} />
          <span>{room.playlist.length} songs</span>
        </div>
      </div>

      {/* Enter Button */}
      <Link
        to={`/room/${room._id}`}
        className="w-full py-3 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
      >
        <LogIn size={20} />
        Enter Room
      </Link>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ message, onCreateRoom }) => (
  <div className="text-center py-20">
    <div className="text-8xl mb-6">🎵</div>
    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
      {message}
    </h3>
    <p className="text-slate-600 dark:text-slate-400 mb-6">
      Create your first room and start listening with friends!
    </p>
    <button
      onClick={onCreateRoom}
      className="px-8 py-4 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all inline-flex items-center gap-2"
    >
      <Plus size={24} />
      Create Room
    </button>
  </div>
);

// Create Room Modal Component
const CreateRoomModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    isPrivate: false,
    maxMembers: 50
  });

  const handleSubmit = () => {
    // TODO: API call to create room
    console.log('Creating room:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full border-2 border-purple-200 dark:border-purple-900">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
          Create New Room 🎵
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Room Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Awesome Room"
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border-2 border-purple-200 dark:border-purple-900 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="private"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="w-5 h-5 rounded border-2 border-purple-300"
            />
            <label htmlFor="private" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Private Room (invite only)
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full border-2 border-purple-200 dark:border-purple-900 text-slate-600 dark:text-slate-400 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;