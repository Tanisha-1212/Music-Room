import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ← Send cookies with every request
});

// No need for token interceptor - cookies are automatic!
// But we'll keep this for potential Authorization header fallback
api.interceptors.request.use(
  (config) => {
    // Cookies are sent automatically by browser
    // This is just a fallback if we need Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  googleLogin: () => {
    window.location.href = `${API_URL}/api/auth/google`;
  },
};

// Room APIs
export const roomAPI = {
  createRoom: (data) => api.post('/rooms', data),
  joinRoom: (roomCode) => api.post('/rooms/join', { roomCode }),
  getMyRooms: () => api.get('/rooms/my-rooms'),
  getRoomDetails: (roomId) => api.get(`/rooms/${roomId}`),
  leaveRoom: (roomCode) => api.post(`/rooms/leave/${roomCode}`),
  deleteRoom: (roomId) => api.delete(`/rooms/${roomId}`),
  addSongToPlaylist: (roomId, data) => api.post(`/rooms/${roomId}/playlist`, data),
  removeSongFromPlaylist: (roomId, songId) => api.delete(`/rooms/${roomId}/playlist/${songId}`),
};

// Music APIs
export const musicAPI = {
  searchMusic: (query, limit = 10) => api.get('/music/search', { params: { q: query, limit } }),
  getMusicDetails: (videoId) => api.get(`/music/details/${videoId}`),
};

export default api;