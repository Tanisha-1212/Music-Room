import Room from '../models/Room.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

// Store active users in rooms
const activeUsers = new Map(); // { socketId: { userId, roomId, username } }

export const setupSocketHandlers = (io) => {
  // Middleware to authenticate socket connections using cookies
  io.use(async (socket, next) => {
    try {
      // Get token from cookie (sent automatically by browser)
      const token = socket.handshake.headers.cookie
        ?.split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      socket.avatar = user.avatar;

      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id} (${socket.username})`);

    // Join a room
    socket.on('join-room', async ({ roomId }) => {
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

        // Send room data to user
        socket.emit('room-data', {
          room,
          activeUsers: roomUsers,
        });

        // Send recent messages
        const messages = await Message.getRecentMessages(roomId, 50);
        socket.emit('chat-history', messages.reverse());

        console.log(`User ${socket.username} joined room ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leave-room', () => {
      handleLeaveRoom(socket, io);
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
        console.error('Play error:', error);
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
        console.error('Pause error:', error);
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
        console.error('Seek error:', error);
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
        console.error('Skip error:', error);
      }
    });

    // Song added to playlist
    socket.on('song-added', async ({ roomId, song }) => {
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

    // Chat message
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
      } catch (error) {
        console.error('Chat message error:', error);
      }
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
  });
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

    activeUsers.delete(socket.id);
    socket.leave(roomId);
  }
};