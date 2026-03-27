const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  updateAvatar,
  discoverUsers,
  rateUser,
  logActivity,
  getActivityFeed,
  hypeActivity,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/discover', protect, discoverUsers);
router.get('/feed', protect, getActivityFeed);
router.put('/profile', protect, updateProfile);
router.put('/profile/avatar', protect, upload.single('avatar'), updateAvatar);
router.post('/activity', protect, logActivity);
router.post('/activity/:activityId/hype', protect, hypeActivity);
router.get('/:id', protect, getUserProfile);
router.post('/:id/rate', protect, rateUser);

module.exports = router;
