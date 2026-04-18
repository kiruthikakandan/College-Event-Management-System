const Event = require('../models/Event');

// ➕ CREATE EVENT (Organizer only)
exports.createEvent = async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: "Access denied" });
    }

    const event = new Event({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      createdBy: req.user.id
    });

    await event.save();

    res.json(event);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 GET ALL EVENTS
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ DELETE EVENT
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};