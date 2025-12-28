import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.currentRoom = null;
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Get backend URL
    const SOCKET_URL = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') // Remove /api from URL
      : 'http://localhost:5000';

    console.log('🔌 Connecting to socket server:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.currentRoom = null;
    }
  }

  // Room events
  joinRoom(roomId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('🚪 Joining room:', roomId);
    this.currentRoom = roomId;
    this.socket.emit('join_room', { roomId });
  }

  leaveRoom() {
    if (!this.socket?.connected || !this.currentRoom) {
      return;
    }

    console.log('🚪 Leaving room:', this.currentRoom);
    this.socket.emit('leave_room', { roomId: this.currentRoom });
    this.currentRoom = null;
  }

  // Chat events
  sendMessage(roomId, message) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('💬 Sending message to room:', roomId);
    this.socket.emit('send_message', {
      roomId,
      message
    });
  }

  // Music control events
  playMusic(roomId, songData) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('play_music', {
      roomId,
      ...songData
    });
  }

  pauseMusic(roomId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('pause_music', { roomId });
  }

  seekMusic(roomId, time) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('seek_music', { roomId, time });
  }

  nextSong(roomId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('next_song', { roomId });
  }

  previousSong(roomId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('previous_song', { roomId });
  }

  // Event listeners
  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Get socket ID
  getId() {
    return this.socket?.id;
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;