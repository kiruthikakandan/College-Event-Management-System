const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { 
  applyEvent, 
  getApplicants, 
  
} = require('../controllers/registrationController');

// 👨‍🎓 Apply
router.post('/:eventId', auth, applyEvent);

// 🧑‍💼 View applicants
router.get('/:eventId', auth, getApplicants);

module.exports = router;