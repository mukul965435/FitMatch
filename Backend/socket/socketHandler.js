/**
 * Socket.io handler for real-time features:
 * - Online/offline tracking
 * - Typing indicators
 * - Room management for direct chat
 */

const User = require('../models/User');

// Map of userId -> socketId
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);

    // User joins with their userId
    socket.on('user_connected', async (userId) => {
      if (!userId) return;

      onlineUsers.set(userId, socket.id);
      socket.join(userId); // Join a room named after userId

      // Update DB
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Broadcast to all
      io.emit('user_online', { userId });
      console.log(`✅ User ${userId} is online`);
    });

    // Join a specific chat room
    socket.on('join_chat', ({ userId, otherUserId }) => {
      const roomId = [userId, otherUserId].sort().join('_');
      socket.join(roomId);
    });

    // Typing indicator
    socket.on('typing', ({ senderId, receiverId }) => {
      socket.to(receiverId).emit('typing', { senderId });
    });

    socket.on('stop_typing', ({ senderId, receiverId }) => {
      socket.to(receiverId).emit('stop_typing', { senderId });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);

      // Find user by socket id
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        await User.findByIdAndUpdate(disconnectedUserId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        io.emit('user_offline', { userId: disconnectedUserId });
      }
    });
  });
};

module.exports = socketHandler;
