const express = require('express');
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getRequests,
  getMatches,
  removeMatch,
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMatches);
router.get('/requests', protect, getRequests);
router.post('/request/:receiverId', protect, sendRequest);
router.put('/accept/:matchId', protect, acceptRequest);
router.put('/reject/:matchId', protect, rejectRequest);
router.delete('/:userId', protect, removeMatch);

module.exports = router;
