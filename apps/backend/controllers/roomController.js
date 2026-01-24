import Room from '../models/Room.js';
import User from '../models/User.js';

// @desc    Create a new room
// @route   POST /api/rooms/create
// @access  Private
export const createRoom = async (req, res) => {
    try {
        const { name, isPrivate, maxMembers } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide room name'
            });
        }

        // Validate name length (from schema: 3-50 chars)
        if (name.length < 3 || name.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'Room name must be between 3 and 50 characters'
            });
        }

        const roomCode = await Room.generateRoomCode();

        const room = await Room.create({
            name, 
            roomCode,
            creator: req.user._id,
            members: [req.user._id],
            isPrivate: isPrivate || false,
            maxMembers: maxMembers || 50
        });

        await room.populate('creator', 'username avatar');

        return res.status(201).json({
            success: true,
            message: 'Room created successfully',
            data: {
                room: room.toPublicJSON() // Hide timestamps
            }
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create room',
            error: error.message
        });
    }
};

// @desc    Join a room by code
// @route   POST /api/rooms/join
// @access  Private
export const joinRoom = async (req, res) => {
    try {
        const { roomCode } = req.body;

        if (!roomCode) {
            return res.status(400).json({
                success: false,
                message: 'Room code is required'
            });
        }

        // Find room by code
        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found or has been closed'
            });
        }

        // Check if room is full
        if (room.members.length >= room.maxMembers) {
            return res.status(400).json({
                success: false,
                message: 'Room is full'
            });
        }

        // Check if user already in room
        if (room.members.includes(req.user._id)) {
            // User already in room, just return room data
            await room.populate('creator members', 'username avatar');
            await room.populate('playlist.addedBy', 'username avatar');
            
            return res.status(200).json({
                success: true,
                message: 'Already in room',
                data: {
                    room: room.toPublicJSON()
                }
            });
        }

        // Add member
        await room.addMember(req.user._id);
        await room.populate('creator members', 'username avatar');
        await room.populate('playlist.addedBy', 'username avatar');

        return res.status(200).json({
            success: true,
            message: 'Successfully joined room',
            data: {
                room: room.toPublicJSON()
            }
        });

    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to join room',
            error: error.message
        });
    }
};

// @desc    Leave a room
// @route   POST /api/rooms/:roomCode/leave
// @access  Private
export const leaveRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if (!room.members.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'User is not in this room'
            });
        }

        // removeMember() handles auto-deletion if room becomes empty
        const result = await room.removeMember(req.user._id);

        // If result is null, room was deleted (was empty)
        if (result === null) {
            return res.status(200).json({
                success: true,
                message: 'Left room successfully (room closed)',
                roomDeleted: true
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Left room successfully',
            roomDeleted: false
        });

    } catch (error) {
        console.error('Leave room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave room',
            error: error.message
        });
    }
};

// @desc    Get room details by code
// @route   GET /api/rooms/:roomCode
// @access  Private
export const getRoomDetails = async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await Room.findOne({ roomCode })
            .populate('creator', 'username avatar')
            .populate('members', 'username avatar')
            .populate('playlist.addedBy', 'username avatar');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check private room access
        if (room.isPrivate && !room.members.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'This is a private room. You must be a member to view it.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Successfully fetched room details',
            data: {
                room: room.toPublicJSON() // Excludes timestamps
            }
        });
    } catch (error) {
        console.error('Get room details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get room details',
            error: error.message
        });
    }
};

// @desc    Add song to room playlist
// @route   POST /api/rooms/:roomCode/playlist/add
// @access  Private
export const addSongToPlaylist = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { videoId, title, artist, thumbnail, duration } = req.body;

        // Validate input (videoId, title, artist are required in schema)
        if (!videoId || !title || !artist) {
            return res.status(400).json({
                success: false,
                message: 'Video ID, title, and artist are required'
            });
        }

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check if user is a member
        if (!room.members.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member to add songs'
            });
        }

        // Create song object
        const songData = {
            videoId,
            title,
            artist,
            thumbnail: thumbnail || `https://img.youtube.com/vi/${videoId}/default.jpg`,
            duration: duration || 0,
            addedBy: req.user._id
        };

        // Add song (this method saves automatically and sets currentSong if first)
        await room.addSong(songData);
        await room.populate('playlist.addedBy', 'username avatar');

        return res.status(200).json({
            success: true,
            message: 'Song added to playlist',
            data: {
                playlist: room.playlist,
                currentSong: room.currentSong
            }
        });

    } catch (error) {
        console.error('Add song error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add song',
            error: error.message
        });
    }
};

// @desc    Remove song from playlist
// @route   DELETE /api/rooms/:roomCode/playlist/:songId
// @access  Private
export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { roomCode, songId } = req.params;

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check if user is a member
        if (!room.members.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member to remove songs'
            });
        }

        // Find the song in playlist
        const song = room.playlist.id(songId);

        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found in playlist'
            });
        }

        // Only allow creator or person who added it to remove
        if (song.addedBy.toString() !== req.user._id.toString() && 
            room.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only remove songs you added (or be the room creator)'
            });
        }

        // Remove song (handles currentSong update automatically)
        await room.removeSong(songId);
        await room.populate('playlist.addedBy', 'username avatar');

        return res.status(200).json({
            success: true,
            message: 'Song removed from playlist',
            data: {
                playlist: room.playlist,
                currentSong: room.currentSong
            }
        });

    } catch (error) {
        console.error('Remove song error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove song',
            error: error.message
        });
    }
};

// @desc    Skip to next song
// @route   POST /api/rooms/:roomCode/skip
// @access  Private
export const skipSong = async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if (!room.members.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member to skip songs'
            });
        }

        // Only creator can skip
        if (room.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the room creator can skip songs'
            });
        }

        if (!room.currentSong || room.playlist.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No songs to skip'
            });
        }

        // Skip to next (uses model method)
        await room.skipToNext();
        await room.populate('playlist.addedBy', 'username avatar');

        return res.status(200).json({
            success: true,
            message: 'Song skipped',
            data: {
                currentSong: room.currentSong,
                playlist: room.playlist
            }
        });

    } catch (error) {
        console.error('Skip song error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to skip song',
            error: error.message
        });
    }
};

// @desc    Update playback state
// @route   PUT /api/rooms/:roomCode/playback
// @access  Private
export const updatePlayback = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { isPlaying, playbackPosition } = req.body;

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if (!room.members.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member to control playback'
            });
        }

        // Only creator can control playback
        if (room.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the room creator can control playback'
            });
        }

        await room.updatePlayback(isPlaying, playbackPosition);

        return res.status(200).json({
            success: true,
            message: 'Playback updated',
            data: {
                isPlaying: room.isPlaying,
                playbackPosition: room.playbackPosition
            }
        });

    } catch (error) {
        console.error('Update playback error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update playback',
            error: error.message
        });
    }
};