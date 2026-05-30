const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    // Snapshot of student details at time of registration
    name: { type: String },
    regno: { type: String },
    dept: { type: String },
    year: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate registration (same student + same event)
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
