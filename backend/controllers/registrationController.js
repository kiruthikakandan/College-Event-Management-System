const Registration = require('../models/Registration');
const User = require('../models/User');
const XLSX = require('xlsx');


// 👨‍🎓 APPLY FOR EVENT
exports.applyEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check if already applied
    const existing = await Registration.findOne({
      student: req.user.id,
      event: eventId
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    // Get student details
    const user = await User.findById(req.user.id);

    const registration = new Registration({
      student: user._id,
      event: eventId,
      name: user.name,
      regno: user.regno,
      dept: user.dept,
      year: user.year
    });

    await registration.save();

    res.json({ message: "Applied successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// 📋 GET APPLICANTS (Organizer)
exports.getApplicants = async (req, res) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId
    });

    res.json(registrations);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



