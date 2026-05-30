const Event = require('../models/Event');
const mongoose = require('mongoose');

// ─── CREATE EVENT (Organizer only) ───────────────────────────
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, capacity } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description?.trim() || '',
      date,
      venue: venue?.trim() || 'TBD',
      capacity: Number(capacity) || 0,
      createdBy: req.user.id,
    });

    res.status(201).json(event);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET ALL EVENTS ───────────────────────────────────────────
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ date: 1 }); // upcoming first
    res.json(events);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET SINGLE EVENT ────────────────────────────────────────
exports.getEventById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    console.error('Get event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── UPDATE EVENT ────────────────────────────────────────────
exports.updateEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only the creator can update
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { title, description, date, venue, capacity } = req.body;
    if (title) event.title = title.trim();
    if (description !== undefined) event.description = description.trim();
    if (date) event.date = date;
    if (venue) event.venue = venue.trim();
    if (capacity !== undefined) event.capacity = Number(capacity);

    await event.save();
    res.json(event);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE EVENT ─────────────────────────────────────────────
exports.deleteEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only the creator can delete
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
