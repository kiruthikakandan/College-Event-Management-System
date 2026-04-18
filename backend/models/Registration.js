const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },

  // snapshot of student details
  name: String,
  regno: String,
  dept: String,
  year: String

}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);