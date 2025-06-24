const mongoose = require('mongoose');

const UserProfSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GoogleUser',
    required: true,
  },
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true,
  },
  contacted: {
    type: Boolean,
    required: true,
    default: false,
  },
  responded: {
    type: Boolean,
    required: true,
    default: false,
  },
});
module.exports = mongoose.model('UserProfTable', UserProfSchema);
