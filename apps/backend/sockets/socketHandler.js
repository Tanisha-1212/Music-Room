import Room from '../models/Room.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Store active users in rooms
const activeUsers = new Map(); // { socketId: { userId, roomId, username } }

export const setupSocketHandlers = (io) => {
  console.log('🔌 Setting up Socket.IO handlers...');

  // Middleware to authenticate socket connections using cookies
  io.use(async (socket, next) => {
    try {
      // Get token from cookie (sent automatically by browser)
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

      // Support both decoded.id and decoded.userId
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

    // ADDED: Handle both 'join_room' and 'join-room' for compatibility
    socket.on('join_room', async ({ roomId }) => {
      await handleJoinRoom(socket, io, roomId);
    });

    socket.on('join-room', async ({ roomId }) => {
      await handleJoinRoom(socket, io, roomId);
    });

    // ADDED: Handle both 'leave_room' and 'leave-room'
    socket.on('leave_room', () => {
      handleLeaveRoom(socket, io);
    });

    socket.on('leave-room', () => {
      handleLeaveRoom(socket, io);
    });

    // ADDED: Handle 'send_message' from frontend
    socket.on('send_message', async ({ roomId, message }) => {
      try {
        if (!socket.userId) return;

        const newMessage = await Message.create({
          room: roomId,
          sender: socket.userId,
          content: message,
          type: 'text',
        });

        await newMessage.populate('sender', 'username avatar');

        io.to(roomId).emit('new_message', newMessage);
        io.to(roomId).emit('chat-message', newMessage); // For compatibility
      } catch (error) {
        console.error('❌ Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Keep existing chat-message handler
    socket.on('chat-message', async ({ roomId, content }) => {
      try {
        if (!socket.userId) return;

        const message = await Message.create({
          room: roomId,
          sender: socket.userId,
          content,
          type: 'text',
        });

        await message.populate('sender', 'username avatar');

        io.to(roomId).emit('chat-message', message);
        io.to(roomId).emit('new_message', message); // For compatibility
      } catch (error) {
        console.error('❌ Chat message error:', error);
      }
    });

    // Playback control - Play
    socket.on('play', async ({ roomId, songId, position }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        room.isPlaying = true;
        room.currentSong = songId;
        room.playbackPosition = position || 0;
        await room.save();

        io.to(roomId).emit('playback-play', {
          songId,
          position: room.playbackPosition,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Play error:', error);
      }
    });

    // ADDED: Handle music control from frontend
    socket.on('play_music', async ({ roomId, songId, currentTime }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        room.isPlaying = true;
        room.currentSong = songId;
        room.playbackPosition = currentTime || 0;
        await room.save();

        socket.to(roomId).emit('music_play', {
          songId,
          currentTime: room.playbackPosition,
        });
        
        socket.to(roomId).emit('playback-play', {
          songId,
          position: room.playbackPosition,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Play music error:', error);
      }
    });

    // Playback control - Pause
    socket.on('pause', async ({ roomId, position }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        room.isPlaying = false;
        room.playbackPosition = position;
        await room.save();

        io.to(roomId).emit('playback-pause', {
          position,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Pause error:', error);
      }
    });

    socket.on('pause_music', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        room.isPlaying = false;
        await room.save();

        socket.to(roomId).emit('music_pause');
        socket.to(roomId).emit('playback-pause', {
          position: room.playbackPosition,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Pause music error:', error);
      }
    });

    // Playback control - Seek
    socket.on('seek', async ({ roomId, position }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        room.playbackPosition = position;
        await room.save();

        socket.to(roomId).emit('playback-seek', {
          position,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Seek error:', error);
      }
    });

    socket.on('seek_music', async ({ roomId, time }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        room.playbackPosition = time;
        await room.save();

        socket.to(roomId).emit('music_seek', { time });
        socket.to(roomId).emit('playback-seek', {
          position: time,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Seek music error:', error);
      }
    });

    // Skip to next song
    socket.on('skip', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        const currentIndex = room.playlist.findIndex(
          (song) => song._id.toString() === room.currentSong?.toString()
        );

        if (currentIndex < room.playlist.length - 1) {
          room.currentSong = room.playlist[currentIndex + 1]._id;
          room.playbackPosition = 0;
          await room.save();

          io.to(roomId).emit('playback-skip', {
            songId: room.currentSong,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('❌ Skip error:', error);
      }
    });

    socket.on('next_song', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        const currentIndex = room.playlist.findIndex(
          (song) => song._id.toString() === room.currentSong?.toString()
        );

        if (currentIndex < room.playlist.length - 1) {
          room.currentSong = room.playlist[currentIndex + 1]._id;
          room.playbackPosition = 0;
          await room.save();

          io.to(roomId).emit('music_next');
          io.to(roomId).emit('playback-skip', {
            songId: room.currentSong,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('❌ Next song error:', error);
      }
    });

    socket.on('previous_song', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        const currentIndex = room.playlist.findIndex(
          (song) => song._id.toString() === room.currentSong?.toString()
        );

        if (currentIndex > 0) {
          room.currentSong = room.playlist[currentIndex - 1]._id;
          room.playbackPosition = 0;
          await room.save();

          io.to(roomId).emit('music_previous');
          io.to(roomId).emit('playback-skip', {
            songId: room.currentSong,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('❌ Previous song error:', error);
      }
    });

    // Song added to playlist
    socket.on('song-added', async ({ roomId, song }) => {
      socket.to(roomId).emit('playlist-updated', {
        action: 'added',
        song,
      });
    });

    socket.on('song_added', async ({ roomId, song }) => {
      socket.to(roomId).emit('playlist_updated', {
        action: 'add',
        song,
      });
      socket.to(roomId).emit('playlist-updated', {
        action: 'added',
        song,
      });
    });

    // Song removed from playlist
    socket.on('song-removed', async ({ roomId, songId }) => {
      socket.to(roomId).emit('playlist-updated', {
        action: 'removed',
        songId,
      });
    });

    socket.on('song_removed', async ({ roomId, songId }) => {
      socket.to(roomId).emit('playlist_updated', {
        action: 'remove',
        songId,
      });
      socket.to(roomId).emit('playlist-updated', {
        action: 'removed',
        songId,
      });
    });

    // Typing indicator
    socket.on('typing-start', ({ roomId }) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('user-stopped-typing', {
        userId: socket.userId,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      handleLeaveRoom(socket, io);
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });

  // Connection monitoring
  setInterval(() => {
    const socketCount = io.engine.clientsCount;
    if (socketCount > 0) {
      console.log(`📊 Active connections: ${socketCount}, Rooms: ${activeUsers.size}`);
    }
  }, 60000);
};

// Helper function to handle joining room
const handleJoinRoom = async (socket, io, roomId) => {
  try {
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const room = await Room.findById(roomId)
      .populate('members', 'username avatar isOnline')
      .populate('creator', 'username avatar')
      .populate('playlist.addedBy', 'username avatar');

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Join socket room
    socket.join(roomId);
    socket.currentRoomId = roomId;

    // Store active user
    activeUsers.set(socket.id, {
      userId: socket.userId,
      username: socket.username,
      avatar: socket.avatar,
      roomId,
    });

    // Get active users in room
    const roomUsers = Array.from(activeUsers.values())
      .filter((user) => user.roomId === roomId);

    // Notify others
    socket.to(roomId).emit('user-joined', {
      userId: socket.userId,
      username: socket.username,
      avatar: socket.avatar,
    });

    socket.to(roomId).emit('user_joined', {
      userId: socket.userId,
      username: socket.username,
    });

    // Send confirmation to user
    socket.emit('room_joined', {
      roomId,
      message: 'Successfully joined room',
    });

    // Send room data to user
    socket.emit('room-data', {
      room,
      activeUsers: roomUsers,
    });

    // Send recent messages
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username avatar');
    
    socket.emit('chat-history', messages.reverse());

    console.log(`✅ User ${socket.username} joined room ${roomId}`);
  } catch (error) {
    console.error('❌ Join room error:', error);
    socket.emit('error', { message: 'Failed to join room' });
  }
};

// Helper function to handle leaving room
const handleLeaveRoom = (socket, io) => {
  const userData = activeUsers.get(socket.id);
  if (userData) {
    const { roomId, userId, username } = userData;
    
    socket.to(roomId).emit('user-left', {
      userId,
      username,
    });

    socket.to(roomId).emit('user_left', {
      userId,
    });

    activeUsers.delete(socket.id);
    socket.leave(roomId);
    
    console.log(`🚪 User ${username} left room ${roomId}`);
  }
};