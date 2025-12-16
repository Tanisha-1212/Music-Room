import api from './api.js';

export const roomAPI = {
  
  createRoom: (data) => api.post('/rooms', data),

  joinRoom: (roomCode) => api.post('/rooms/join', { roomCode }),

  leaveRoom: (roomCode) => api.post(`/rooms/leave/${roomCode}`),

  getMyRooms: () => api.get('/rooms/my-rooms'),

  getRoomDetails: (roomId) => api.get(`/rooms/${roomId}`),

  deleteRoom: (roomId) => api.delete(`/rooms/${roomId}`),

  addSongToPlaylist: (roomId, songData) => 
    api.post(`/rooms/${roomId}/playlist`, songData),

  removeSongFromPlaylist: (roomId, songId) => 
    api.delete(`/rooms/${roomId}/playlist/${songId}`),
};