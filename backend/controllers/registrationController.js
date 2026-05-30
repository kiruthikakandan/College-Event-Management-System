const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');
const XLSX = require('xlsx');

// ─── APPLY FOR EVENT (Student only) ──────────────────────────
exports.applyEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Check event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check capacity (0 = unlimited)
    if (event.capacity > 0) {
      const count = await Registration.countDocuments({ event: eventId });
      if (count >= event.capacity) {
        return res.status(400).json({ message: 'Event is fully booked' });
      }
    }

    // Check if already applied
    const existing = await Registration.findOne({
      student: req.user.id,
      event: eventId,
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already registered for this event' });
    }

    // Get student details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const registration = await Registration.create({
      student: user._id,
      event: eventId,
      name: user.name,
      regno: user.regno || '',
      dept: user.dept || '',
      year: user.year || '',
    });

    res.status(201).json({ message: 'Registered for event successfully', registration });
  } catch (err) {
    // Handle MongoDB duplicate key (race condition safety)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already registered for this event' });
    }
    console.error('Apply event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── CANCEL REGISTRATION (Student) ───────────────────────────
exports.cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const registration = await Registration.findOneAndDelete({
      student: req.user.id,
      event: eventId,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    console.error('Cancel registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET MY REGISTRATIONS (Student) ──────────────────────────
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user.id })
      .populate('event', 'title date venue description');
    res.json(registrations);
  } catch (err) {
    console.error('Get my registrations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET APPLICANTS FOR EVENT (Organizer) ────────────────────
exports.getApplicants = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const registrations = await Registration.find({ event: eventId })
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (err) {
    console.error('Get applicants error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── EXPORT APPLICANTS TO EXCEL (Organizer) ──────────────────
exports.exportApplicants = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = await Registration.find({ event: eventId }).sort({ createdAt: 1 });

    if (registrations.length === 0) {
      return res.status(404).json({ message: 'No registrations found for this event' });
    }

    const data = registrations.map((r, i) => ({
      'S.No': i + 1,
      Name: r.name,
      'Reg No': r.regno,
      Department: r.dept,
      Year: r.year,
      'Registered On': new Date(r.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = `${event.title.replace(/\s+/g, '_')}_registrations.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
