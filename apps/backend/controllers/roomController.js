import Room from '../models/Room.js';
import User from '../models/User.js';

export const createRoom = async (req, res) => {
    try {
        const {name, isPrivate, maxMembers} = req.body;

        if(!name){
            return res.status(400).json({
                success: false,
                message: 'Please provide full information'
            });
        }

        const roomCode = await Room.generateRoomCode();

        const room = await Room.create({
            name, 
            roomCode,
            creator : req.user._id,
            members: [req.user._id],
            isPrivate: isPrivate || false,
            maxMembers : maxMembers || 50
        })

        await room.populate('creator', 'username avatar');

        return res.status(201).json({
            success : true,
            message : 'Room created successfully',
            data : {
                room
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

export const joinRoom = async (req, res) => {
    try {
        const { roomCode } = req.body;

        // Validate input
        if (!roomCode) {
            return res.status(400).json({
                success: false,
                message: 'Room code is required'
            });
        }

        // Find active room
        const room = await Room.findOne({ roomCode, isActive: true });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
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
            return res.status(400).json({
                success: false,
                message: 'You are already in this room'
            });
        }

        // Add member (this method already saves)
        await room.addMember(req.user._id);

        // Populate creator and members
        await room.populate('creator members', 'username avatar');

        return res.status(200).json({
            success: true,
            message: 'Successfully joined room',
            data: {
                room
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


export const leaveRoom = async(req, res) => {
    try {
        const {roomCode} = req.params;

        const room = await Room.findOne({ roomCode, isActive: true});

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if(!room.members.includes(req.user._id)){
            return res.status(400).json({
                success : false,
                message: 'User is not present in the room'
            });
        }

        if(room.creator.toString() === req.user._id.toString() && room.members.length === 1){
            await Room.findByIdAndDelete(room._id);
            return res.status(200).json({
                success: true,
                message: 'Room deleted successfully'
            });
        }
        await room.removeMember(req.user._id);

        return res.status(200).json({
            success: true,
            message: 'Left room successfully'
        });
    } catch (error) {
        console.error('Leave room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave room',
            error: error.message
        });
    }
}

export const getMyRooms = async(req, res) => {
    try {
        const rooms = await Room.find({
            $or: [
                {creator : req.user._id},
                {members : req.user._id}
            ],
            isActive: true
        }).populate('creator', 'username avatar');

        return res.status(200).json({
            success : true,
            message : 'Successfully fetched all rooms',
            data : {
                rooms
            }
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get rooms',
            error: error.message
        });
    }
}

export const getRoomDetails = async(req, res) => {
    try {
        const {roomId} = req.params;

        const room = await Room.findById(roomId)
            .populate('creator', 'username avatar email')
            .populate('members', 'username avatar');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if(room.isPrivate && !room.members.includes(req.user._id)){
            return res.status(400).json({
                message : 'User is not a member of this room',
                success : false
            });
        }

        return res.status(200).json({
            success : true,
            message : 'Successfully fetched room details',
            data : {
                room
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
}

export const deleteRoom = async(req, res) => {
    try {
        const {roomId} = req.params;

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if(room.creator.toString() !== req.user._id.toString()){
            return res.status(400).json({
                success : false,
                message : 'You are not allowed to delete this room'
            });
        }

        await Room.findByIdAndDelete(roomId);

        return res.status(200).json({
            success : true,
            message : 'Successfully deleted this room'
        });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get room details',
            error: error.message
        });
    }
}

export const addSongToPlaylist = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { title, artist, url, thumbnail, duration } = req.body;

        // Validate input
        if (!title || !artist || !url) {
            return res.status(400).json({
                success: false,
                message: 'Title, artist, and URL are required'
            });
        }

        // Find room
        const room = await Room.findById(roomId);

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
            title,
            artist,
            url,
            thumbnail,
            duration,
            addedBy: req.user._id,
            addedAt: new Date()
        };

        // Add song (this method saves automatically)
        await room.addSong(songData);

        // Populate to get user info
        await room.populate('playlist.addedBy', 'username avatar');

        return res.status(200).json({
            success: true,
            message: 'Song added to playlist',
            data: {
                playlist: room.playlist
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

export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { roomId, songId } = req.params;

        // Find room
        const room = await Room.findById(roomId);

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

        //Only allow creator or person who added it to remove
        if (song.addedBy.toString() !== req.user._id.toString() && 
            room.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only remove songs you added (or be the room creator)'
            });
        }
        

        // Remove song (this method saves automatically)
        await room.removeSong(songId);

        return res.status(200).json({
            success: true,
            message: 'Song removed from playlist',
            data: {
                playlist: room.playlist
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