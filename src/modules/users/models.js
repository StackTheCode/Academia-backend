const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  authType: {
    type: String,
    required: true,
    enum: ['google', 'local'],
    default: 'local',
  },
  googleId: {
    type: String,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  uploadedFiles: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('User', UserSchema);
