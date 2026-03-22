const asyncHandler = require('express-async-handler');
const Match = require('../models/Match');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to calculate compatibility score
const calcScore = (sender, receiver) => {
  let score = 0;
  if (sender.gymName && receiver.gymName &&
      sender.gymName.toLowerCase() === receiver.gymName.toLowerCase()) score += 30;
  const sharedGoals = sender.fitnessGoals.filter(g => receiver.fitnessGoals.includes(g));
  score += Math.min(sharedGoals.length * 5, 25);
  if (sender.workoutTime === receiver.workoutTime) score += 20;
  if (sender.fitnessLevel === receiver.fitnessLevel) score += 15;
  const sharedDays = sender.workoutDays.filter(d => receiver.workoutDays.includes(d));
  score += Math.min(sharedDays.length * 2, 10);
  return score;
};

// @desc    Send a connection request
// @route   POST /api/matches/request/:receiverId
// @access  Private
const sendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;

  if (receiverId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot send a request to yourself');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if request already exists
  const existingMatch = await Match.findOne({
    $or: [
      { sender: req.user._id, receiver: receiverId },
      { sender: receiverId, receiver: req.user._id },
    ],
  });

  if (existingMatch) {
    res.status(400);
    throw new Error('Connection request already exists');
  }

  const sender = await User.findById(req.user._id);
  const score = calcScore(sender, receiver);

  const match = await Match.create({
    sender: req.user._id,
    receiver: receiverId,
    compatibilityScore: score,
  });

  // Update users' sentRequests / receivedRequests
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { sentRequests: receiverId } });
  await User.findByIdAndUpdate(receiverId, { $addToSet: { receivedRequests: req.user._id } });

  // Create notification
  await Notification.create({
    recipient: receiverId,
    sender: req.user._id,
    type: 'match_request',
    message: `${sender.name} sent you a gym buddy request! 💪`,
    link: `/profile/${req.user._id}`,
  });

  // Emit real-time notification
  const io = req.app.get('io');
  io.to(receiverId.toString()).emit('notification', {
    type: 'match_request',
    message: `${sender.name} sent you a gym buddy request!`,
  });

  res.status(201).json({ success: true, data: match });
});

// @desc    Accept a connection request
// @route   PUT /api/matches/accept/:matchId
// @access  Private
const acceptRequest = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.matchId);

  if (!match) {
    res.status(404);
    throw new Error('Match request not found');
  }

  if (match.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to accept this request');
  }

  match.status = 'accepted';
  await match.save();

  // Add to each other's matches list
  await User.findByIdAndUpdate(match.sender, {
    $addToSet: { matches: match.receiver },
    $pull: { sentRequests: match.receiver },
  });
  await User.findByIdAndUpdate(match.receiver, {
    $addToSet: { matches: match.sender },
    $pull: { receivedRequests: match.sender },
  });

  const receiver = await User.findById(match.receiver);

  // Notify sender
  await Notification.create({
    recipient: match.sender,
    sender: req.user._id,
    type: 'match_accepted',
    message: `${receiver.name} accepted your gym buddy request! 🎉`,
    link: `/chat/${req.user._id}`,
  });

  const io = req.app.get('io');
  io.to(match.sender.toString()).emit('notification', {
    type: 'match_accepted',
    message: `${receiver.name} accepted your gym buddy request!`,
  });
  io.to(match.sender.toString()).emit('match_accepted', { matchId: match._id });

  res.json({ success: true, data: match });
});

// @desc    Reject a connection request
// @route   PUT /api/matches/reject/:matchId
// @access  Private
const rejectRequest = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.matchId);

  if (!match) {
    res.status(404);
    throw new Error('Match request not found');
  }

  if (match.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to reject this request');
  }

  match.status = 'rejected';
  await match.save();

  await User.findByIdAndUpdate(match.sender, { $pull: { sentRequests: match.receiver } });
  await User.findByIdAndUpdate(match.receiver, { $pull: { receivedRequests: match.sender } });

  res.json({ success: true, message: 'Request rejected' });
});

// @desc    Get pending received requests
// @route   GET /api/matches/requests
// @access  Private
const getRequests = asyncHandler(async (req, res) => {
  const matches = await Match.find({
    receiver: req.user._id,
    status: 'pending',
  })
    .populate('sender', 'name profilePicture fitnessLevel gymName workoutTime fitnessGoals')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: matches });
});

// @desc    Get all accepted matches (gym buddies)
// @route   GET /api/matches
// @access  Private
const getMatches = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'matches',
    'name profilePicture fitnessLevel gymName workoutTime isOnline lastSeen'
  );

  res.json({ success: true, data: user.matches });
});

// @desc    Remove a match / unfriend
// @route   DELETE /api/matches/:userId
// @access  Private
const removeMatch = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { matches: req.params.userId } });
  await User.findByIdAndUpdate(req.params.userId, { $pull: { matches: req.user._id } });

  await Match.findOneAndDelete({
    $or: [
      { sender: req.user._id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user._id },
    ],
  });

  res.json({ success: true, message: 'Match removed' });
});

module.exports = { sendRequest, acceptRequest, rejectRequest, getRequests, getMatches, removeMatch };
