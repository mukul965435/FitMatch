const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to create conversation ID (consistent regardless of sender/receiver order)
const getConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// @desc    Send a message
// @route   POST /api/messages/:receiverId
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { receiverId } = req.params;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error('Receiver not found');
  }

  const conversationId = getConversationId(req.user._id, receiverId);

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content: content.trim(),
    conversationId,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name profilePicture')
    .populate('receiver', 'name profilePicture');

  // Emit real-time via socket
  const io = req.app.get('io');
  io.to(receiverId.toString()).emit('new_message', populatedMessage);
  io.to(req.user._id.toString()).emit('new_message', populatedMessage);

  // Notification if receiver is offline
  if (!receiver.isOnline) {
    const sender = await User.findById(req.user._id);
    await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: 'new_message',
      message: `${sender.name} sent you a message`,
      link: `/chat/${req.user._id}`,
    });
  }

  res.status(201).json({ success: true, data: populatedMessage });
});

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const conversationId = getConversationId(req.user._id, req.params.userId);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversationId })
    .populate('sender', 'name profilePicture')
    .populate('receiver', 'name profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Mark all as read
  await Message.updateMany(
    { conversationId, receiver: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    data: messages.reverse(), // oldest first
    page,
  });
});

// @desc    Get all conversations (inbox)
// @route   GET /api/messages
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get latest message per conversation
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  // Populate sender/receiver
  const populated = await Promise.all(
    conversations.map(async (conv) => {
      const otherId =
        conv.lastMessage.sender.toString() === userId.toString()
          ? conv.lastMessage.receiver
          : conv.lastMessage.sender;

      const otherUser = await User.findById(otherId).select('name profilePicture isOnline lastSeen');
      return { ...conv, otherUser };
    })
  );

  res.json({ success: true, data: populated });
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:userId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const conversationId = getConversationId(req.user._id, req.params.userId);
  await Message.updateMany(
    { conversationId, receiver: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true, message: 'Messages marked as read' });
});

module.exports = { sendMessage, getConversation, getConversations, markAsRead };
