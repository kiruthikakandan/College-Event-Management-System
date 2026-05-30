const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

// Anyone authenticated can list events
router.get('/', auth, getEvents);
router.get('/:id', auth, getEventById);

// Organizer only
router.post('/', auth, requireRole('organizer'), createEvent);
router.put('/:id', auth, requireRole('organizer'), updateEvent);
router.delete('/:id', auth, requireRole('organizer'), deleteEvent);

module.exports = router;
