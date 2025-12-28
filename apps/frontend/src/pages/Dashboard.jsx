import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import { Plus, Hash, Users, Music, ChevronRight, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { rooms, fetchMyRooms, createRoom, joinRoom, loading } = useRoom();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const onCreateRoom = () => setShowCreateModal(true);
  const onJoinRoom = () => setShowJoinModal(true);

  const handleCreateRoom = async (roomData) => {
    const result = await createRoom(roomData);
    if (result.success) {
      setShowCreateModal(false);
      navigate(`/room/${result.room._id}`);
    }
    return result;
  };

  const handleJoinRoom = async (roomCode) => {
    const result = await joinRoom(roomCode);
    if (result.success) {
      setShowJoinModal(false);
      navigate(`/room/${result.room._id}`);
    }
    return result;
  };

  useEffect(() => {
    fetchMyRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome{user?.username ? ',' : ''}{' '}
            <span className="text-[#6495ED] animate-slide-up inline-block">
              {user?.username || 'Listener'}
            </span>
            {' '}👋
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400 animate-fade-in-delay">
            Ready to vibe together? Join a room and start listening
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button
            onClick={onCreateRoom}
            className="flex items-center gap-2 text-white bg-[#6495ED] rounded-lg px-6 py-3 font-semibold shadow-lg hover:shadow-xl hover:bg-[#5680D6] transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Room
          </button>
          <button
            onClick={onJoinRoom}
            className="flex items-center gap-2 text-white bg-[#6495ED] rounded-lg px-6 py-3 font-semibold shadow-lg hover:shadow-xl hover:bg-[#5680D6] transition-all"
          >
            <Hash className="w-5 h-5" />
            Join Room
          </button>
        </div>

        {/* Room List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#6495ED]" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading rooms...</span>
            </div>
          ) : rooms.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Rooms ({rooms.length})
                </h2>
              </div>

              <div className="grid gap-4">
                {rooms.map(room => (
                  <div
                    key={room._id}
                    onClick={() => navigate(`/room/${room._id}`)}
                    className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-[#6495ED] transition-colors">
                          🎵 {room.name}
                        </h3>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {room.members?.length || 0} members
                          </span>
                          <span className="flex items-center">
                            <Music className="w-4 h-4 mr-1" />
                            {room.playlist?.length || 0} songs
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            room.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {room.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#6495ED] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                No rooms yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first room or join one.
              </p>
              <button
                onClick={onCreateRoom}
                className="px-6 py-3 bg-[#6495ED] text-white rounded-lg hover:bg-[#4169E1] transition-colors"
              >
                Create your first room
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
        />
      )}

      {showJoinModal && (
        <JoinRoomModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinRoom}
        />
      )}

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s backwards;
        }
      `}</style>
    </div>
  );
};

const CreateRoomModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    isPrivate: false,
    maxMembers: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await onCreate(formData);
    
    if (!result.success) {
      setError(result.error || 'Failed to create room');
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Create New Room
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Room Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6495ED] focus:border-transparent"
              placeholder="Chill Playlist"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="w-4 h-4 text-[#6495ED] rounded focus:ring-[#6495ED]"
            />
            <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Private Room (requires code to join)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Max Members
            </label>
            <input
              type="number"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6495ED] focus:border-transparent"
              min="2"
              max="100"
            />
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#6495ED] text-white rounded-lg hover:bg-[#4169E1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const JoinRoomModal = ({ onClose, onJoin }) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (roomCode.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onJoin(roomCode);

    if (!result.success) {
      setError(result.error || 'Failed to join room');
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Join Room
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-[#6495ED] focus:border-transparent"
              placeholder="ABC123"
              maxLength={6}
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Enter the 6-character room code
            </p>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || roomCode.length !== 6}
              className="flex-1 px-4 py-2 bg-[#6495ED] text-white rounded-lg hover:bg-[#4169E1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;