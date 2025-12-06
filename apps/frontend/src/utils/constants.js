// API URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ROOM: '/room/:roomId',
  AUTH_SUCCESS: '/auth/success',
  AUTH_ERROR: '/auth/error',
};

// Local Storage Keys (not used anymore with cookies, but keeping for reference)
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  SYSTEM: 'system',
};

// Room Settings
export const ROOM_SETTINGS = {
  MAX_MEMBERS: {
    MIN: 2,
    MAX: 100,
    DEFAULT: 50,
  },
  NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
  },
};

// Music Settings
export const MUSIC_SETTINGS = {
  SEARCH_LIMIT: 10,
  MAX_PLAYLIST_SIZE: 100,
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Room
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_DATA: 'room-data',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',

  // Playback
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
  SKIP: 'skip',
  PLAYBACK_PLAY: 'playback-play',
  PLAYBACK_PAUSE: 'playback-pause',
  PLAYBACK_SEEK: 'playback-seek',
  PLAYBACK_SKIP: 'playback-skip',

  // Playlist
  PLAYLIST_UPDATED: 'playlist-updated',

  // Chat
  CHAT_MESSAGE: 'chat-message',
  CHAT_HISTORY: 'chat-history',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  USER_TYPING: 'user-typing',
  USER_STOPPED_TYPING: 'user-stopped-typing',
};

// Utility function to format duration (seconds to MM:SS)
export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Utility function to format timestamp
export const formatTimestamp = (date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInSeconds = Math.floor((now - messageDate) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  return messageDate.toLocaleDateString();
};

// YouTube embed URL generator
export const getYouTubeEmbedUrl = (videoId) => {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
};

// Extract video ID from YouTube URL
export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};