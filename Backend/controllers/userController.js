const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Match = require('../models/Match');
const cloudinary = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -sentRequests -receivedRequests')
    .populate('matches', 'name profilePicture fitnessLevel gymName');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, data: user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const {
    name, age, gender, bio, gymName, fitnessLevel,
    fitnessGoals, workoutTime, workoutDays, locationName,
    longitude, latitude,
  } = req.body;

  if (name) user.name = name;
  if (age) user.age = age;
  if (gender) user.gender = gender;
  if (bio !== undefined) user.bio = bio;
  if (gymName !== undefined) user.gymName = gymName;
  if (fitnessLevel) user.fitnessLevel = fitnessLevel;
  if (fitnessGoals) user.fitnessGoals = Array.isArray(fitnessGoals) ? fitnessGoals : JSON.parse(fitnessGoals);
  if (workoutTime) user.workoutTime = workoutTime;
  if (workoutDays) user.workoutDays = Array.isArray(workoutDays) ? workoutDays : JSON.parse(workoutDays);
  if (locationName !== undefined) user.locationName = locationName;

  // Update geolocation — only if valid numbers (guard against NaN/empty strings)
  if (longitude !== undefined && latitude !== undefined) {
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (isFinite(lng) && isFinite(lat)) {
      user.location = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }
    // If not finite, simply skip the location update (leave existing value)
  }

  const updatedUser = await user.save();
  res.json({ success: true, data: updatedUser });
});

// @desc    Upload profile picture
// @route   PUT /api/users/profile/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  // Delete old image from Cloudinary if exists
  if (user.profilePicturePublicId) {
    await cloudinary.uploader.destroy(user.profilePicturePublicId);
  }

  user.profilePicture = req.file.path;
  user.profilePicturePublicId = req.file.filename;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      profilePicture: user.profilePicture,
      profilePicturePublicId: user.profilePicturePublicId,
    },
  });
});

// @desc    Discover / explore gym buddies (smart matching)
// @route   GET /api/users/discover
// @access  Private
const discoverUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filters from query
  const { fitnessLevel, fitnessGoals, workoutTime, maxDistance, gym } = req.query;

  // Users to exclude: self, already matched, sent requests, received requests
  const excludeIds = [
    currentUser._id,
    ...currentUser.matches,
    ...currentUser.sentRequests,
    ...currentUser.receivedRequests,
  ];

  let query = {
    _id: { $nin: excludeIds },
  };

  // Apply filters
  if (fitnessLevel) query.fitnessLevel = fitnessLevel;
  if (workoutTime) query.workoutTime = workoutTime;
  if (fitnessGoals) {
    const goals = Array.isArray(fitnessGoals) ? fitnessGoals : [fitnessGoals];
    query.fitnessGoals = { $in: goals };
  }
  if (gym) {
    query.gymName = { $regex: gym, $options: 'i' };
  }

  // Location-based query
  const radius = parseInt(maxDistance) || 10; // km
  const [lng, lat] = currentUser.location.coordinates;

  let users;
  let total;

  // Only do geo query if user has set a real location
  if (lng !== 0 || lat !== 0) {
    const geoQuery = {
      ...query,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius * 1000, // convert km to meters
        },
      },
    };

    users = await User.find(geoQuery)
      .select('-password -sentRequests -receivedRequests -activities')
      .skip(skip)
      .limit(limit);
    // countDocuments does NOT support $near, so we use the base query for total matching users
    total = await User.countDocuments(query);
  } else {
    users = await User.find(query)
      .select('-password -sentRequests -receivedRequests -activities')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    total = await User.countDocuments(query);
  }

  // Score each user for compatibility
  const scoredUsers = users.map((u) => {
    let score = 0;

    // Same gym (+30)
    if (u.gymName && currentUser.gymName &&
        u.gymName.toLowerCase() === currentUser.gymName.toLowerCase()) {
      score += 30;
    }

    // Shared fitness goals (+5 each, max 25)
    const sharedGoals = u.fitnessGoals.filter((g) => currentUser.fitnessGoals.includes(g));
    score += Math.min(sharedGoals.length * 5, 25);

    // Same workout time (+20)
    if (u.workoutTime === currentUser.workoutTime) score += 20;

    // Same fitness level (+15)
    if (u.fitnessLevel === currentUser.fitnessLevel) score += 15;

    // Shared workout days (+2 each, max 10)
    const sharedDays = u.workoutDays.filter((d) => currentUser.workoutDays.includes(d));
    score += Math.min(sharedDays.length * 2, 10);

    return { ...u.toObject(), compatibilityScore: score };
  });

  // Sort by compatibility score descending
  scoredUsers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  res.json({
    success: true,
    data: scoredUsers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Add rating/review after workout
// @route   POST /api/users/:id/rate
// @access  Private
const rateUser = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Please provide a rating between 1 and 5');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot rate yourself');
  }

  // Check if already rated
  const existingRating = user.ratings.find(
    (r) => r.from.toString() === req.user._id.toString()
  );

  if (existingRating) {
    existingRating.rating = rating;
    existingRating.review = review || '';
  } else {
    user.ratings.push({ from: req.user._id, rating, review: review || '' });
  }

  user.updateAverageRating();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Rating submitted',
    data: { averageRating: user.averageRating, totalRatings: user.totalRatings },
  });
});

// @desc    Log activity
// @route   POST /api/users/activity
// @access  Private
const logActivity = asyncHandler(async (req, res) => {
  const { type, description } = req.body;

  if (!type || !description) {
    res.status(400);
    throw new Error('Please provide activity type and description');
  }

  const user = await User.findById(req.user._id);
  user.activities.unshift({ type, description });

  // Keep only last 20 activities
  if (user.activities.length > 20) {
    user.activities = user.activities.slice(0, 20);
  }

  await user.save({ validateBeforeSave: false });

  res.json({ success: true, data: user.activities[0] });
});

// @desc    Get activity feed
// @route   GET /api/users/feed
// @access  Private
const getActivityFeed = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);

  // Get activities from current user and matches
  const feedUsers = await User.find({
    _id: { $in: [currentUser._id, ...currentUser.matches] },
  })
    .select('name profilePicture activities')
    .lean();

  // Flatten, add userName, and sort by date
  let feed = [];
  feedUsers.forEach((u) => {
    u.activities.forEach((a) => {
      feed.push({ ...a, user: { _id: u._id, name: u.name, profilePicture: u.profilePicture } });
    });
  });

  feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  feed = feed.slice(0, 50);

  res.json({ success: true, data: feed });
});

// @desc    Hype (like) an activity
// @route   POST /api/users/activity/:activityId/hype
// @access  Private
const hypeActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;

  // Find user who has this activity
  const targetUser = await User.findOne({ 'activities._id': activityId });
  if (!targetUser) {
    res.status(404);
    throw new Error('Activity not found');
  }

  const activity = targetUser.activities.id(activityId);
  const userIdStr = req.user._id.toString();

  const index = activity.likes.findIndex((id) => id.toString() === userIdStr);

  if (index !== -1) {
    // Unlike
    activity.likes.splice(index, 1);
  } else {
    // Like
    activity.likes.push(req.user._id);
  }

  await targetUser.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      likes: activity.likes,
      isLiked: index === -1,
    },
  });
});

module.exports = {
  getUserProfile,
  updateProfile,
  updateAvatar,
  discoverUsers,
  rateUser,
  logActivity,
  getActivityFeed,
  hypeActivity,
};
