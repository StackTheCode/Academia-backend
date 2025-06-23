const mongoose = require('mongoose');

const SynonymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Required by Typesense
      trim: true,
    },
    synonyms: {
      type: [String],
      required: true,
      validate: (v) => Array.isArray(v) && v.length >= 2, // Should have at least two terms
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Synonym', SynonymSchema);
