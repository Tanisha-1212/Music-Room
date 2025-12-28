import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import { useMusic } from '../context/MusicContext';
import socketService from '../services/socket';
import { Users, Music, Search, X, ArrowLeft, Send, Trash2, Volume2, Plus, Loader2 } from 'lucide-react';
import MusicPlayer from '../components/MusicPlayer';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRoom, getRoomDetails, addSongToPlaylist } = useRoom();
  const { searchMusic, searchResults, loading: searchLoading, clearSearch } = useMusic();
  
  const [loading, setLoading] = useState(true);
  const [showMemberSidebar, setShowMemberSidebar] = useState(false);
  const [showPlaylistSidebar, setShowPlaylistSidebar] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const initRoom = async () => {
      try {
        const result = await getRoomDetails(roomId);

        if (!result.success) {
          navigate('/');
          return;
        }

        socketService.joinRoom(roomId);
        
        // Listen for new messages
        socketService.on('new_message', (message) => {
          setMessages(prev => [...prev, message]);
        });

        setLoading(false);
      } catch (error) {
        console.error('Failed to load room:', error);
        navigate('/');
      }
    };

    initRoom();

    return () => {
      socketService.leaveRoom();
      socketService.off('new_message');
      clearSearch();
    };
  }, [roomId, getRoomDetails, navigate, clearSearch]);

  // Handle music search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    await searchMusic(searchQuery, 10);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
  };

  // Add song to playlist
  const handleAddSong = async (song) => {
    const result = await addSongToPlaylist(roomId, {
      videoId: song.videoId,
      title: song.title,
      artist: song.artist || song.channel,
      thumbnail: song.thumbnail,
      duration: song.duration
    });

    if (result.success) {
      // Optionally show success message
      console.log('Song added to playlist');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketService.sendMessage(roomId, newMessage);
    setNewMessage('');
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      socketService.leaveRoom();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6495ED] border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4">Room not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#6495ED] text-white rounded-lg hover:bg-[#5a83d1] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black">
      {/* Room Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeaveRoom}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Leave room"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{currentRoom.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Code: {currentRoom.roomCode}
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  handleClearSearch();
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                showSearch
                  ? 'bg-[#6495ED] text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              aria-label="Search music"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowPlaylistSidebar(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Show playlist"
            >
              <Music className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMemberSidebar(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1"
              aria-label="Show members"
            >
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">{currentRoom.members?.length || 0}</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Results */}
        {showSearch && (
          <div className="mt-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-[#6495ED] text-gray-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </form>

            {/* Search Results Dropdown */}
            {(searchLoading || searchResults.length > 0) && (
              <div className="mt-2 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#6495ED]" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Searching...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {searchResults.map((song) => (
                      <div
                        key={song.videoId}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                      >
                        {/* Thumbnail */}
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                        
                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {song.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {song.artist || song.channel}
                          </p>
                          {song.duration && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {song.duration}
                            </p>
                          )}
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={() => handleAddSong(song)}
                          className="p-2 rounded-lg bg-[#6495ED] text-white hover:bg-[#5a83d1] transition-colors flex-shrink-0"
                          aria-label="Add to playlist"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Music Player Section */}
        <div className={`flex-1 flex flex-col ${showChat ? 'lg:w-2/3' : 'w-full'}`}>
          <MusicPlayer room={currentRoom} />
        </div>

        {/* Chat Section */}
        {showChat && (
          <div className="w-full lg:w-1/3 border-l border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-black">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No messages yet. Start the conversation! 💬
                </div>
              ) : (
                messages.map((msg, index) => (
                  <ChatMessage key={index} message={msg} currentUser={user} />
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-[#6495ED] text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-lg bg-[#6495ED] text-white hover:bg-[#5a83d1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Member Sidebar */}
      {showMemberSidebar && (
        <MemberSidebar
          room={currentRoom}
          onClose={() => setShowMemberSidebar(false)}
          currentUser={user}
        />
      )}

      {/* Playlist Sidebar */}
      {showPlaylistSidebar && (
        <PlaylistSidebar
          room={currentRoom}
          onClose={() => setShowPlaylistSidebar(false)}
          currentUser={user}
        />
      )}

      {/* Mobile Chat Toggle */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="lg:hidden fixed bottom-20 right-4 p-4 rounded-full bg-[#6495ED] text-white shadow-lg hover:bg-[#5a83d1] transition-colors"
        >
          <Send className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, currentUser }) => {
  const isCurrentUser = message.sender._id === currentUser?.id;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        {!isCurrentUser && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
            {message.sender.username}
          </p>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-[#6495ED] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <p className="text-xs text-gray-400 mt-1 px-1">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

// Member Sidebar Component
const MemberSidebar = ({ room, onClose, currentUser }) => {
  return (
    <div className="fixed inset-0 z-50 lg:relative">
      <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={onClose}></div>
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({room.members?.length || 0})
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {room.members?.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#6495ED] flex items-center justify-center text-white font-bold">
                    {member.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {member.username}
                    {member._id === room.creator._id && (
                      <span className="ml-2 text-xs bg-[#6495ED] text-white px-2 py-1 rounded">
                        Host
                      </span>
                    )}
                  </p>
                  {member.isOnline && (
                    <p className="text-xs text-green-500">● Online</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Playlist Sidebar Component
const PlaylistSidebar = ({ room, onClose, currentUser }) => {
  const { removeSongFromPlaylist } = useRoom();
  const isCreator = room.creator._id === currentUser?.id;

  const handleRemoveSong = async (songId) => {
    if (window.confirm('Remove this song from the playlist?')) {
      await removeSongFromPlaylist(room._id, songId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:relative">
      <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={onClose}></div>
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Music className="w-5 h-5" />
            Playlist ({room.playlist?.length || 0})
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {room.playlist?.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No songs in playlist yet 🎵
            </div>
          ) : (
            room.playlist?.map((song, index) => (
              <div
                key={song._id}
                className={`p-3 rounded-lg border transition-colors ${
                  song._id === room.currentSong
                    ? 'bg-[#6495ED]/10 border-[#6495ED]'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                      {song._id === room.currentSong && (
                        <Volume2 className="w-4 h-4 text-[#6495ED]" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                  {isCreator && (
                    <button
                      onClick={() => handleRemoveSong(song._id)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Room;