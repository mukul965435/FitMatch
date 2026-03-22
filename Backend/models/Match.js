const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    // Compatibility score (0-100)
    compatibilityScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate match requests
matchSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
