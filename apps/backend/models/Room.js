import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  url: {
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
      type: Number, // Current position in seconds
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roomSchema.index({ roomCode: 1 });
roomSchema.index({ creator: 1 });
roomSchema.index({ isActive: 1 });

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
    await this.save();
  }
  
  return this;
};

// Remove member from room
roomSchema.methods.removeMember = async function (userId) {
  this.members = this.members.filter(
    (memberId) => memberId.toString() !== userId.toString()
  );
  await this.save();
  return this;
};

// Add song to playlist
roomSchema.methods.addSong = async function (songData) {
  this.playlist.push(songData);
  await this.save();
  return this;
};

// Remove song from playlist
roomSchema.methods.removeSong = async function (songId) {
  this.playlist = this.playlist.filter(
    (song) => song._id.toString() !== songId.toString()
  );
  await this.save();
  return this;
};

export default mongoose.model('Room', roomSchema);