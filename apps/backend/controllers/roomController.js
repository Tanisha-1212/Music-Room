import Room from '../models/Room.js';
import { getMusicDetails } from '../services/youtubeService.js';

// @desc    Create a new room
// @route   POST /api/rooms
export const createRoom = async (req, res) => {
  try {
    const { name, isPrivate, maxMembers } = req.body;

    // Generate unique room code
    const roomCode = await Room.generateRoomCode();

    // Create room
    const room = await Room.create({
      name,
      roomCode,
      creator: req.user._id,
      members: [req.user._id], // Creator is first member
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 50,
    });

    // Populate creator info
    await room.populate('creator', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room },
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error.message,
    });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/join
export const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: 'Room code is required',
      });
    }

    // Find room by code
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase(), isActive: true });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if already a member
    if (room.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this room',
      });
    }

    // Add member
    await room.addMember(req.user._id);

    // Populate members
    await room.populate('members', 'username avatar isOnline');
    await room.populate('creator', 'username avatar');

    res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      data: { room },
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to join room',
    });
  }
};

// @desc    Leave a room by room code
// @route   POST /api/rooms/leave/:roomCode
export const leaveRoomByCode = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is a member
    if (!room.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this room',
      });
    }

    // Remove member
    await room.removeMember(req.user._id);

    // Deactivate room if it becomes empty
    if (room.members.length === 0) {
      room.isActive = false;
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: 'Left room successfully',
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave room',
      error: error.message,
    });
  }
};

// @desc    Leave a room
// @route   POST /api/rooms/:roomId/leave
export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is a member
    if (!room.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this room',
      });
    }

    // Remove member
    await room.removeMember(req.user._id);

    // Deactivate room if it becomes empty
    if (room.members.length === 0) {
      room.isActive = false;
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: 'Left room successfully',
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave room',
      error: error.message,
    });
  }
};

// @desc    Get room details
// @route   GET /api/rooms/:roomId
export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId)
      .populate('creator', 'username avatar isOnline')
      .populate('members', 'username avatar isOnline')
      .populate('playlist.addedBy', 'username avatar');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { room },
    });
  } catch (error) {
    console.error('Get room details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get room details',
      error: error.message,
    });
  }
};

// @desc    Get user's rooms
// @route   GET /api/rooms/my-rooms
export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user._id,
      isActive: true,
    })
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { rooms },
    });
  } catch (error) {
    console.error('Get my rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rooms',
      error: error.message,
    });
  }
};

// @desc    Delete room (creator only)
// @route   DELETE /api/rooms/:roomId
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is creator
    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the room creator can delete the room',
      });
    }

    room.isActive = false;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error.message,
    });
  }
};

// @desc    Add song to playlist
// @route   POST /api/rooms/:roomId/playlist
export const addSongToPlaylist = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { videoId, url } = req.body;

    if (!videoId && !url) {
      return res.status(400).json({
        success: false,
        message: 'Video ID or YouTube URL is required',
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is a member
    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to add songs',
      });
    }

    // Fetch music details from YouTube
    const musicData = await getMusicDetails(videoId || url);

    // Add song to playlist
    await room.addSong({
      title: musicData.title,
      artist: musicData.artist,
      url: musicData.url,
      thumbnail: musicData.thumbnail,
      duration: musicData.duration,
      addedBy: req.user._id,
    });

    await room.populate('playlist.addedBy', 'username avatar');

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('playlist-updated', {
        action: 'added',
        song: room.playlist[room.playlist.length - 1],
      });
    }

    res.status(201).json({
      success: true,
      message: 'Song added to playlist',
      data: { 
        song: room.playlist[room.playlist.length - 1],
        playlist: room.playlist 
      },
    });
  } catch (error) {
    console.error('Add song error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add song',
      error: error.message,
    });
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/rooms/:roomId/playlist/:songId
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { roomId, songId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is a member or creator
    const isMember = room.members.includes(req.user._id);
    const isCreator = room.creator.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to remove songs',
      });
    }

    // Remove song
    await room.removeSong(songId);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('playlist-updated', {
        action: 'removed',
        songId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Song removed from playlist',
      data: { playlist: room.playlist },
    });
  } catch (error) {
    console.error('Remove song error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove song',
      error: error.message,
    });
  }
};