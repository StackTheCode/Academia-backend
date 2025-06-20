const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
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

module.exports = mongoose.model('GoogleUser', UserSchema);
