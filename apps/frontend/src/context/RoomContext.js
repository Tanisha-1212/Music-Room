import { createContext, useContext, useState, useEffect } from 'react';
import { roomAPI, musicAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const RoomContext = createContext();

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Room state
  const [currentRoom, setCurrentRoom] = useState(null);
  const [myRooms, setMyRooms] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Music state
  const [playlist, setPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Fetch user's rooms
  const fetchMyRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getMyRooms();
      setMyRooms(response.data.data.rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setError(error.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  // Create room
  const createRoom = async (roomData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomAPI.createRoom(roomData);
      const room = response.data.data.room;
      
      setCurrentRoom(room);
      setMyRooms((prev) => [...prev, room]);
      
      return { success: true, room };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create room';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Join room
  const joinRoom = async (roomCode) => {
    try {
      setLoading(true);
      setError(null);
      
      // Join via API
      const response = await roomAPI.joinRoom(roomCode);
      const room = response.data.data.room;
      
      setCurrentRoom(room);
      setPlaylist(room.playlist || []);
      setCurrentSong(room.currentSong);
      setIsPlaying(room.isPlaying);
      setPlaybackPosition(room.playbackPosition || 0);
      
      // Join via Socket.io
      socketService.joinRoom(room._id);
      
      return { success: true, room };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join room';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Leave room
  const leaveRoom = async () => {
    try {
      if (!currentRoom) return;
      
      await roomAPI.leaveRoom(currentRoom.roomCode);
      socketService.leaveRoom();
      
      setCurrentRoom(null);
      setPlaylist([]);
      setCurrentSong(null);
      setIsPlaying(false);
      setMessages([]);
      setActiveUsers([]);
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  // Get room details
  const getRoomDetails = async (roomId) => {
    try {
      const response = await roomAPI.getRoomDetails(roomId);
      const room = response.data.data.room;
      
      setCurrentRoom(room);
      setPlaylist(room.playlist || []);
      
      return room;
    } catch (error) {
      console.error('Failed to get room details:', error);
      throw error;
    }
  };

  // Music search
  const searchMusic = async (query, limit = 10) => {
    try {
      setSearchLoading(true);
      const response = await musicAPI.searchMusic(query, limit);
      setSearchResults(response.data.data.results);
      return response.data.data.results;
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search music');
      return [];
    } finally {
      setSearchLoading(false);
    }
  };

  // Add song to playlist
  const addSongToPlaylist = async (videoId) => {
    try {
      if (!currentRoom) return { success: false, error: 'No active room' };
      
      const response = await roomAPI.addSongToPlaylist(currentRoom._id, { videoId });
      const newSong = response.data.data.song;
      
      setPlaylist((prev) => [...prev, newSong]);
      
      return { success: true, song: newSong };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add song';
      return { success: false, error: message };
    }
  };

  // Remove song from playlist
  const removeSongFromPlaylist = async (songId) => {
    try {
      if (!currentRoom) return;
      
      await roomAPI.removeSongFromPlaylist(currentRoom._id, songId);
      setPlaylist((prev) => prev.filter((song) => song._id !== songId));
    } catch (error) {
      console.error('Failed to remove song:', error);
      setError('Failed to remove song');
    }
  };

  // Playback controls
  const play = (songId, position = 0) => {
    if (!currentRoom) return;
    socketService.play(currentRoom._id, songId, position);
  };

  const pause = (position) => {
    if (!currentRoom) return;
    socketService.pause(currentRoom._id, position);
  };

  const seek = (position) => {
    if (!currentRoom) return;
    socketService.seek(currentRoom._id, position);
  };

  const skip = () => {
    if (!currentRoom) return;
    socketService.skip(currentRoom._id);
  };

  // Chat
  const sendMessage = (content) => {
    if (!currentRoom) return;
    socketService.sendMessage(currentRoom._id, content);
  };

  const startTyping = () => {
    if (!currentRoom) return;
    socketService.startTyping(currentRoom._id);
  };

  const stopTyping = () => {
    if (!currentRoom) return;
    socketService.stopTyping(currentRoom._id);
  };

  // Socket.io event listeners
  useEffect(() => {
    // Room events
    socketService.on('room-data', (data) => {
      setCurrentRoom(data.room);
      setPlaylist(data.room.playlist || []);
      setActiveUsers(data.activeUsers || []);
    });

    socketService.on('user-joined', (data) => {
      setActiveUsers((prev) => [...prev, data]);
      
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: `${data.username} joined the room`,
          timestamp: new Date(),
        },
      ]);
    });

    socketService.on('user-left', (data) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: `${data.username} left the room`,
          timestamp: new Date(),
        },
      ]);
    });

    // Playback events
    socketService.on('playback-play', (data) => {
      setCurrentSong(data.songId);
      setIsPlaying(true);
      setPlaybackPosition(data.position);
    });

    socketService.on('playback-pause', (data) => {
      setIsPlaying(false);
      setPlaybackPosition(data.position);
    });

    socketService.on('playback-seek', (data) => {
      setPlaybackPosition(data.position);
    });

    socketService.on('playback-skip', (data) => {
      setCurrentSong(data.songId);
      setPlaybackPosition(0);
    });

    // Playlist events
    socketService.on('playlist-updated', (data) => {
      if (data.action === 'added') {
        setPlaylist((prev) => [...prev, data.song]);
      } else if (data.action === 'removed') {
        setPlaylist((prev) => prev.filter((s) => s._id !== data.songId));
      }
    });

    // Chat events
    socketService.on('chat-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketService.on('chat-history', (history) => {
      setMessages(history);
    });

    socketService.on('user-typing', (data) => {
      setTypingUsers((prev) => [...prev, data]);
    });

    socketService.on('user-stopped-typing', (data) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // Cleanup
    return () => {
      socketService.off('room-data');
      socketService.off('user-joined');
      socketService.off('user-left');
      socketService.off('playback-play');
      socketService.off('playback-pause');
      socketService.off('playback-seek');
      socketService.off('playback-skip');
      socketService.off('playlist-updated');
      socketService.off('chat-message');
      socketService.off('chat-history');
      socketService.off('user-typing');
      socketService.off('user-stopped-typing');
    };
  }, [currentRoom]);

  // Fetch user's rooms on mount
  useEffect(() => {
    if (user) {
      fetchMyRooms();
    }
  }, [user]);

  const value = {
    // Room
    currentRoom,
    myRooms,
    activeUsers,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomDetails,
    fetchMyRooms,

    // Music
    playlist,
    currentSong,
    isPlaying,
    playbackPosition,
    searchResults,
    searchLoading,
    searchMusic,
    addSongToPlaylist,
    removeSongFromPlaylist,

    // Playback
    play,
    pause,
    seek,
    skip,

    // Chat
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};