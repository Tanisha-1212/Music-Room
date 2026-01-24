import Room from '../models/Room.js';
// ❌ REMOVED: import Message from '../models/Message.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Store active users in rooms
const activeUsers = new Map(); // { socketId: { userId, roomId, username, avatar } }

// ✅ NEW: Store chat messages in memory only (per room)
const roomMessages = new Map(); // { roomId: [messages array] }

const MAX_MESSAGES_PER_ROOM = 100; // Keep last 100 messages in memory

export const setupSocketHandlers = (io) => {
  console.log('🔌 Setting up Socket.IO handlers...');

  // Middleware to authenticate socket connections using cookies
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;

      if (!cookies) {
        console.log('⚠️ No cookies found in socket handshake');
        return next(new Error('Authentication required'));
      }

      const token = cookies.split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        console.log('⚠️ No token found in cookies');
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      const userId = decoded.id || decoded.userId;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      socket.avatar = user.avatar;

      console.log(`✅ Socket authenticated: ${user.username}`);
      next();
    } catch (error) {
      console.error('❌ Socket auth error:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id} (${socket.username})`);

    // Join room
    socket.on('join_room', async ({ roomCode }) => {
      await handleJoinRoom(socket, io, roomCode);
    });

    socket.on('join-room', async ({ roomCode }) => {
      await handleJoinRoom(socket, io, roomCode);
    });

    // Leave room
    socket.on('leave_room', async () => {
      await handleLeaveRoom(socket, io);
    });

    socket.on('leave-room', async () => {
      await handleLeaveRoom(socket, io);
    });

    // ✅ CHAT: In-memory only (no database saves)
    socket.on('send_message', async ({ roomCode, message }) => {
      try {
        if (!socket.userId || !socket.currentRoomCode) return;

        // Create message object (in-memory only)
        const newMessage = {
          id: `${Date.now()}-${socket.userId}`,
          roomCode,
          sender: {
            _id: socket.userId,
            username: socket.username,
            avatar: socket.avatar
          },
          content: message,
          type: 'text',
          timestamp: new Date()
        };

        // Store in memory
        if (!roomMessages.has(roomCode)) {
          roomMessages.set(roomCode, []);
        }
        
        const messages = roomMessages.get(roomCode);
        messages.push(newMessage);
        
        // Keep only last MAX_MESSAGES_PER_ROOM messages
        if (messages.length > MAX_MESSAGES_PER_ROOM) {
          messages.shift();
        }

        // Broadcast to room
        io.to(roomCode).emit('new_message', newMessage);
        io.to(roomCode).emit('chat-message', newMessage); // Compatibility
      } catch (error) {
        console.error('❌ Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat-message', async ({ roomCode, content }) => {
      socket.emit('send_message', { roomCode, message: content });
    });

    // Playback control - Play
    socket.on('play_music', async ({ roomCode, songId, currentTime }) => {
      try {
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        // Only creator can control playback
        if (room.creator.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only room creator can control playback' });
          return;
        }

        await room.updatePlayback(true, currentTime || 0);
        room.currentSong = songId;
        await room.save();

        socket.to(roomCode).emit('music_play', {
          songId,
          currentTime: room.playbackPosition,
        });
        
        socket.to(roomCode).emit('playback-play', {
          songId,
          position: room.playbackPosition,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Play music error:', error);
      }
    });

    socket.on('play', async ({ roomCode, songId, position }) => {
      socket.emit('play_music', { roomCode, songId, currentTime: position });
    });

    // Playback control - Pause
    socket.on('pause_music', async ({ roomCode }) => {
      try {
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        if (room.creator.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only room creator can control playback' });
          return;
        }

        await room.updatePlayback(false, room.playbackPosition);

        socket.to(roomCode).emit('music_pause');
        socket.to(roomCode).emit('playback-pause', {
          position: room.playbackPosition,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Pause music error:', error);
      }
    });

    socket.on('pause', async ({ roomCode, position }) => {
      socket.emit('pause_music', { roomCode });
    });

    // Playback control - Seek
    socket.on('seek_music', async ({ roomCode, time }) => {
      try {
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        if (room.creator.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only room creator can control playback' });
          return;
        }

        await room.updatePlayback(room.isPlaying, time);

        socket.to(roomCode).emit('music_seek', { time });
        socket.to(roomCode).emit('playback-seek', {
          position: time,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Seek music error:', error);
      }
    });

    socket.on('seek', async ({ roomCode, position }) => {
      socket.emit('seek_music', { roomCode, time: position });
    });

    // Skip to next song
    socket.on('next_song', async ({ roomCode }) => {
      try {
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        if (room.creator.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only room creator can skip songs' });
          return;
        }

        await room.skipToNext();

        io.to(roomCode).emit('music_next', {
          songId: room.currentSong
        });
        
        io.to(roomCode).emit('playback-skip', {
          songId: room.currentSong,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Next song error:', error);
      }
    });

    socket.on('skip', async ({ roomCode }) => {
      socket.emit('next_song', { roomCode });
    });

    // Previous song
    socket.on('previous_song', async ({ roomCode }) => {
      try {
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        if (room.creator.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only room creator can control playback' });
          return;
        }

        const currentIndex = room.playlist.findIndex(
          (song) => song._id.toString() === room.currentSong?.toString()
        );

        if (currentIndex > 0) {
          room.currentSong = room.playlist[currentIndex - 1]._id;
          room.playbackPosition = 0;
          await room.save();

          io.to(roomCode).emit('music_previous', {
            songId: room.currentSong
          });
          
          io.to(roomCode).emit('playback-skip', {
            songId: room.currentSong,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('❌ Previous song error:', error);
      }
    });

    // Song added to playlist
    socket.on('song_added', async ({ roomCode, song }) => {
      socket.to(roomCode).emit('playlist_updated', {
        action: 'add',
        song,
      });
      socket.to(roomCode).emit('playlist-updated', {
        action: 'added',
        song,
      });
    });

    socket.on('song-added', async ({ roomCode, song }) => {
      socket.emit('song_added', { roomCode, song });
    });

    // Song removed from playlist
    socket.on('song_removed', async ({ roomCode, songId }) => {
      socket.to(roomCode).emit('playlist_updated', {
        action: 'remove',
        songId,
      });
      socket.to(roomCode).emit('playlist-updated', {
        action: 'removed',
        songId,
      });
    });

    socket.on('song-removed', async ({ roomCode, songId }) => {
      socket.emit('song_removed', { roomCode, songId });
    });

    // Typing indicator
    socket.on('typing-start', ({ roomCode }) => {
      socket.to(roomCode).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on('typing-stop', ({ roomCode }) => {
      socket.to(roomCode).emit('user-stopped-typing', {
        userId: socket.userId,
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      await handleLeaveRoom(socket, io);
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });

  // ✅ NEW: Cleanup old messages from memory periodically
  setInterval(() => {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    for (const [roomCode, messages] of roomMessages.entries()) {
      // Remove messages older than 1 hour
      const filtered = messages.filter(msg => 
        (now - new Date(msg.timestamp).getTime()) < ONE_HOUR
      );
      
      if (filtered.length === 0) {
        roomMessages.delete(roomCode);
      } else {
        roomMessages.set(roomCode, filtered);
      }
    }
  }, 300000); // Every 5 minutes

  // Connection monitoring
  setInterval(() => {
    const socketCount = io.engine.clientsCount;
    if (socketCount > 0) {
      console.log(`📊 Active connections: ${socketCount}, Active rooms: ${activeUsers.size}, Messages cached: ${roomMessages.size} rooms`);
    }
  }, 60000);
};

// Helper function to handle joining room
const handleJoinRoom = async (socket, io, roomCode) => {
  try {
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const room = await Room.findOne({ roomCode })
      .populate('members', 'username avatar isOnline')
      .populate('creator', 'username avatar')
      .populate('playlist.addedBy', 'username avatar');

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Check if user is a member
    if (!room.members.some(m => m._id.toString() === socket.userId)) {
      socket.emit('error', { message: 'You are not a member of this room' });
      return;
    }

    // Join socket room
    socket.join(roomCode);
    socket.currentRoomCode = roomCode;

    // Store active user
    activeUsers.set(socket.id, {
      userId: socket.userId,
      username: socket.username,
      avatar: socket.avatar,
      roomCode,
    });

    // Get active users in room
    const roomUsers = Array.from(activeUsers.values())
      .filter((user) => user.roomCode === roomCode);

    // Notify others
    socket.to(roomCode).emit('user-joined', {
      userId: socket.userId,
      username: socket.username,
      avatar: socket.avatar,
    });

    socket.to(roomCode).emit('user_joined', {
      userId: socket.userId,
      username: socket.username,
    });

    // Send confirmation to user
    socket.emit('room_joined', {
      roomCode,
      message: 'Successfully joined room',
    });

    // Send room data to user
    socket.emit('room-data', {
      room: room.toPublicJSON(),
      activeUsers: roomUsers,
    });

    // ✅ Send recent messages from memory (not database)
    const messages = roomMessages.get(roomCode) || [];
    socket.emit('chat-history', messages.slice(-50)); // Last 50 messages

    console.log(`✅ User ${socket.username} joined room ${roomCode}`);
  } catch (error) {
    console.error('❌ Join room error:', error);
    socket.emit('error', { message: 'Failed to join room' });
  }
};

// Helper function to handle leaving room
const handleLeaveRoom = async (socket, io) => {
  const userData = activeUsers.get(socket.id);
  if (userData) {
    const { roomCode, userId, username } = userData;
    
    try {
      // ✅ Remove user from room members in database
      const room = await Room.findOne({ roomCode });
      if (room && room.members.includes(userId)) {
        const result = await room.removeMember(userId);
        
        // If room was deleted (became empty), clean up messages
        if (result === null) {
          roomMessages.delete(roomCode);
          console.log(`🗑️ Room ${roomCode} deleted (empty) and messages cleared`);
        }
      }
    } catch (error) {
      console.error('❌ Error removing member from room:', error);
    }

    socket.to(roomCode).emit('user-left', {
      userId,
      username,
    });

    socket.to(roomCode).emit('user_left', {
      userId,
    });

    activeUsers.delete(socket.id);
    socket.leave(roomCode);
    
    console.log(`🚪 User ${username} left room ${roomCode}`);
  }
};