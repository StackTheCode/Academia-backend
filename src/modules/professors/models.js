const mongoose = require('mongoose');

const ProfessorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    researchInterests: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    personal_website: String,
  },
  { timestamps: true }
);

ProfessorSchema.index({ collegeId: 1, departmentId: 1 });
ProfessorSchema.index({ researchInterests: 1 });

module.exports = mongoose.model('Professor', ProfessorSchema);
