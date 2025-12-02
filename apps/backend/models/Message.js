import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'system'], // 'system' for notifications like "User joined"
      default: 'text',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

// Static method to get recent messages
messageSchema.statics.getRecentMessages = async function (roomId, limit = 50) {
  return await this.find({ room: roomId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'username avatar')
    .lean();
};

export default mongoose.model('Message', messageSchema);