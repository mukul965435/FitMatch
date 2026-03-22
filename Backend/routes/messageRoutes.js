const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getConversations, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getConversations);
router.post('/:receiverId', protect, sendMessage);
router.get('/:userId', protect, getConversation);
router.put('/:userId/read', protect, markAsRead);

module.exports = router;
