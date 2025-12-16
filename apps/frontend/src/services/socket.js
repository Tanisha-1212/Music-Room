import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if(this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
        withCredentials : true,
        transports : ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
        console.log('Socket connected: ', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    })
  }

  disconnect() {
    if(this.socket) {
        this.socket.disconnect();
        this.socket = null;
    }
  }

  // Room events
  joinRoom(roomId) { 
    this.socket?.emit('join-room', {roomId});
  }
  leaveRoom() {
    this.socket?.emit('leave-room');
  }

  // Music events
  play(roomId, songId, position) { 
    this.socket?.emit('play', {roomId, songId, position});
   }

  pause(roomId, position) {
    this.socket?.emit('pause', {roomId, position});
   }
  
   seek(roomId, position){
    this.socket?.emit('seek', {roomId, position});
   }

   skip(roomId){
    this.socket?.emit('skip', {roomId});
   }

   //playlist events

   songAdded(roomId, song){
    this.socket?.emit('song-added', {roomId, song});
   }

   songRemoved(roomId, songId){
    this.socket?.emit('song-removed', {roomId, songId});
   }


  // Chat events
  sendMessage(roomId, content) {
    this.socket?.emit('chat-message', {roomId, content});
  }
  
  startTyping(roomId){
    this.socket?.emit('typing-start', {roomId});
  }

  stopTyping(roomId){
    this.socket?.emit("typing-stop", {roomId});
  }
  // Listeners
  onRoomData(callback) {
    this.socket?.on('room-data', callback);
  }
  onChatHistory(callback){
    this.socket?.on('chat-history', callback);
  }
  onUserJoined(callback){
    this.socket?.on('uer-joined', callback);
  }
  onUserLeft(callback){
    this.socket?.on('user-left', callback);
  }
  onPlay(callback){
    this.socket?.on('playback-play', callback);
  }
  onPause(callback){
    this.socket?.on('playback-pause', callback);
  }
  onSeek(callback){
    this.socket?.on('playback-seek', callback);
  }
  onSkip(callback){
    this.socket?.on('playback-skip', callback);
  }
  onPlayListUpdated(callback){
    this.socket?.on('playlist-updated', callback);
  }
  onChatMessage(callback){
    this.socket?.on('chat-message', callback);
  }
  onUserTyping(callback){
    this.socket?.on('user-typing', callback);
  }
  onUserStoppedTyping(callback){
    this.socket?.on('user-stopped-typing', callback);
  }
  onError(callback){
    this.socket?.on('error', callback);
  }

  //remove listeners
  off(eventname, callback){
    this.socket?.off(eventname, callback);
  }
  removeAllListeners(eventName){
    this.socket?.removeAllListeners(eventName);
  }
}

export default new SocketService();