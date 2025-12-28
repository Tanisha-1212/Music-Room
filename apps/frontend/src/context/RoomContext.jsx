// src/context/RoomContext.jsx
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const RoomContext = createContext();

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/rooms/my-rooms');

      const rooms = response.data.data.rooms;
      setRooms(rooms);

      return {
        success: true
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch rooms';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData) => {
    try {
      setError(null);
      const response = await api.post('/rooms', roomData);

      const room = response.data.data.room;
      setCurrentRoom(room);
      setRooms(prev => [...prev, room]);

      return {
        success: true,
        room
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create room';
      setError(message);
      return { success: false, error: message };
    }
  };

  const joinRoom = async (roomCode) => {
    try {
      setError(null);
      const response = await api.post('/rooms/join', { roomCode });

      const room = response.data.data.room;
      setCurrentRoom(room);
      setRooms(prev => [...prev, room]);

      return {
        success: true,
        room
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join room';
      setError(message);
      return { success: false, error: message };
    }
  };

  const leaveRoom = async (roomCode) => {
    try {
      setError(null);
      await api.post(`/rooms/leave/${roomCode}`);

      setCurrentRoom(null);
      setRooms(prev => prev.filter(room => room.roomCode !== roomCode));

      return {
        success: true
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave room';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      setError(null);
      await api.delete(`/rooms/${roomId}`);

      setCurrentRoom(null);
      setRooms(prev => prev.filter(room => room._id !== roomId));

      return {
        success: true
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete room';
      setError(message);
      return { success: false, error: message };
    }
  };

  const getRoomDetails = async (roomId) => {
    try {
      setError(null);
      const response = await api.get(`/rooms/${roomId}`);

      const room = response.data.data.room;
      setCurrentRoom(room);

      return {
        success: true,
        room
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch room';
      setError(message);
      return { success: false, error: message };
    }
  };

  const addSongToPlaylist = async (roomId, songData) => {
    try {
      setError(null);
      const response = await api.post(`/rooms/${roomId}/playlist`, songData);

      const playlist = response.data.data.playlist;
      setCurrentRoom(prev => ({
        ...prev,
        playlist: playlist
      }));

      return {
        success: true,
        playlist
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add song';
      setError(message);
      return { success: false, error: message };
    }
  };

  const removeSongFromPlaylist = async (roomId, songId) => {
    try {
      setError(null);
      const response = await api.delete(`/rooms/${roomId}/playlist/${songId}`);

      const playlist = response.data.data.playlist;
      setCurrentRoom(prev => ({
        ...prev,
        playlist: playlist
      }));

      return {
        success: true,
        playlist
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove song';
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    rooms,
    currentRoom,
    loading,
    error,
    fetchMyRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    getRoomDetails,
    addSongToPlaylist,
    removeSongFromPlaylist,
    setCurrentRoom,
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};