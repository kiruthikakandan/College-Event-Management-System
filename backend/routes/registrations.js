const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  applyEvent,
  cancelRegistration,
  getMyRegistrations,
  getApplicants,
  exportApplicants,
} = require('../controllers/registrationController');

// Student routes
router.post('/:eventId', auth, requireRole('student'), applyEvent);
router.delete('/:eventId', auth, requireRole('student'), cancelRegistration);
router.get('/my/registrations', auth, requireRole('student'), getMyRegistrations);

// Organizer routes
router.get('/:eventId', auth, requireRole('organizer'), getApplicants);
router.get('/:eventId/export', auth, requireRole('organizer'), exportApplicants);

module.exports = router;
