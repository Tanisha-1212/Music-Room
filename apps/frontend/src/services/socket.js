import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      withCredentials: true, // ← Send cookies!
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      // No need to emit 'authenticate' - cookie is sent automatically!
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Room events
  joinRoom(roomId) {
    this.socket?.emit('join-room', { roomId });
  }

  leaveRoom() {
    this.socket?.emit('leave-room');
  }

  // Playback events
  play(roomId, songId, position = 0) {
    this.socket?.emit('play', { roomId, songId, position });
  }

  pause(roomId, position) {
    this.socket?.emit('pause', { roomId, position });
  }

  seek(roomId, position) {
    this.socket?.emit('seek', { roomId, position });
  }

  skip(roomId) {
    this.socket?.emit('skip', { roomId });
  }

  // Chat events
  sendMessage(roomId, content) {
    this.socket?.emit('chat-message', { roomId, content });
  }

  startTyping(roomId) {
    this.socket?.emit('typing-start', { roomId });
  }

  stopTyping(roomId) {
    this.socket?.emit('typing-stop', { roomId });
  }

  // Event listeners
  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

export default new SocketService();