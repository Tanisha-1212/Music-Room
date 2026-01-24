import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  duration: {
    type: Number, // in seconds
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      minlength: [3, 'Room name must be at least 3 characters'],
      maxlength: [50, 'Room name cannot exceed 50 characters'],
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      length: 6,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    playlist: [songSchema],
    currentSong: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    playbackPosition: {
      type: Number,
      default: 0,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    maxMembers: {
      type: Number,
      default: 50,
      min: 2,
      max: 100,
    },
    // ✅ Keep for cleanup but don't show to users
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // ✅ Keep for cleanup logic
  }
);

// Indexes
roomSchema.index({ roomCode: 1 });
roomSchema.index({ lastActivity: 1 }); // For cleanup of stale rooms only

// ✅ Update lastActivity on any change
roomSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Generate unique room code
roomSchema.statics.generateRoomCode = async function () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;

  while (exists) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    exists = await this.findOne({ roomCode: code });
  }

  return code;
};

// Add member to room
roomSchema.methods.addMember = async function (userId) {
  if (this.members.length >= this.maxMembers) {
    throw new Error('Room is full');
  }
  
  if (!this.members.includes(userId)) {
    this.members.push(userId);
    this.lastActivity = new Date();
    await this.save();
  }
  
  return this;
};

// Remove member from room
roomSchema.methods.removeMember = async function (userId) {
  this.members = this.members.filter(
    (memberId) => memberId.toString() !== userId.toString()
  );
  
  // ✅ Auto-delete room if no members left
  if (this.members.length === 0) {
    await this.deleteOne();
    return null;
  }
  
  this.lastActivity = new Date();
  await this.save();
  return this;
};

// Add song to playlist
roomSchema.methods.addSong = async function (songData) {
  this.playlist.push(songData);
  
  // ✅ Set currentSong if this is the first song
  if (this.playlist.length === 1 && !this.currentSong) {
    this.currentSong = this.playlist[0]._id;
  }
  
  this.lastActivity = new Date();
  await this.save();
  return this;
};

// Remove song from playlist
roomSchema.methods.removeSong = async function (songId) {
  // ✅ Check if removing current song
  const isCurrentSong = this.currentSong?.toString() === songId.toString();
  
  this.playlist = this.playlist.filter(
    (song) => song._id.toString() !== songId.toString()
  );
  
  // ✅ Update currentSong if needed
  if (isCurrentSong) {
    if (this.playlist.length > 0) {
      this.currentSong = this.playlist[0]._id;
    } else {
      this.currentSong = null;
      this.isPlaying = false;
    }
  }
  
  this.lastActivity = new Date();
  await this.save();
  return this;
};

// ✅ NEW: Skip to next song
roomSchema.methods.skipToNext = async function () {
  if (!this.currentSong || this.playlist.length === 0) {
    throw new Error('No songs in playlist');
  }
  
  const currentIndex = this.playlist.findIndex(
    (song) => song._id.toString() === this.currentSong.toString()
  );
  
  if (currentIndex === -1) {
    // Current song not found, play first song
    this.currentSong = this.playlist[0]._id;
  } else {
    // Move to next song (loop to beginning if at end)
    const nextIndex = (currentIndex + 1) % this.playlist.length;
    this.currentSong = this.playlist[nextIndex]._id;
  }
  
  this.playbackPosition = 0;
  this.lastActivity = new Date();
  await this.save();
  return this;
};

// ✅ NEW: Update playback state
roomSchema.methods.updatePlayback = async function (isPlaying, position) {
  this.isPlaying = isPlaying;
  if (position !== undefined) {
    this.playbackPosition = position;
  }
  this.lastActivity = new Date();
  await this.save();
  return this;
};

// ✅ Static method to cleanup stale rooms (safety net only)
roomSchema.statics.cleanupInactiveRooms = async function (inactiveMinutes = 30) {
  const cutoffTime = new Date(Date.now() - inactiveMinutes * 60 * 1000);
  
  // Only delete rooms that have been inactive for too long
  // Empty rooms should already be deleted by removeMember()
  const result = await this.deleteMany({
    lastActivity: { $lt: cutoffTime }
  });
  
  if (result.deletedCount > 0) {
    console.log(`🧹 Cleaned up ${result.deletedCount} stale rooms`);
  }
  
  return result;
};

// ✅ Get active rooms count
roomSchema.statics.getActiveRoomsCount = async function () {
  return await this.countDocuments({
    members: { $exists: true, $ne: [] }
  });
};

// ✅ Get total listeners count
roomSchema.statics.getTotalListenersCount = async function () {
  const result = await this.aggregate([
    { $match: { members: { $exists: true, $ne: [] } } },
    { $project: { memberCount: { $size: '$members' } } },
    { $group: { _id: null, total: { $sum: '$memberCount' } } }
  ]);
  
  return result[0]?.total || 0;
};

// ✅ NEW: Get room by code (helper for controllers)
roomSchema.statics.findByCode = async function (roomCode) {
  return await this.findOne({ roomCode })
    .populate('creator', 'username avatar')
    .populate('members', 'username avatar')
    .populate('playlist.addedBy', 'username avatar');
};

// ✅ NEW: Transform for API responses (excludes timestamps)
roomSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    roomCode: this.roomCode,
    creator: this.creator,
    members: this.members,
    playlist: this.playlist,
    currentSong: this.currentSong,
    isPlaying: this.isPlaying,
    playbackPosition: this.playbackPosition,
    isPrivate: this.isPrivate,
    maxMembers: this.maxMembers,
    // ❌ Exclude: createdAt, updatedAt, lastActivity
  };
};

export default mongoose.model('Room', roomSchema);