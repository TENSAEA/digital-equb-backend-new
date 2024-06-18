const express = require('express');
const { getEligibleMembers, storeEqubDraw } = require('../controllers/equbDrawController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Route to get eligible members for a specific equb
router.get('/eligible-members/:equbId', authMiddleware, getEligibleMembers);

// Route to store draw information after a draw is completed
router.post('/store-draw', authMiddleware, storeEqubDraw); // Requires authentication

module.exports = router;
  