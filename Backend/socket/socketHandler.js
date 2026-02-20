const jwt = require('jsonwebtoken');
const User = require('../models/User');

const connectedUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar role isBanned');

      if (!user || user.isBanned) {
        return next(new Error('Unauthorized'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 User connected: ${socket.user.name} (${userId})`);

    // Join user-specific room for private notifications
    socket.join(`user_${userId}`);
    connectedUsers.set(userId, socket.id);

    // Notify others of online status
    socket.broadcast.emit('user_online', { userId, name: socket.user.name });

    // Join a chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`💬 ${socket.user.name} joined chat: ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Typing indicator
    socket.on('typing_start', ({ chatId }) => {
      socket.to(`chat_${chatId}`).emit('typing', {
        userId,
        name: socket.user.name,
        isTyping: true,
        chatId,
      });
    });

    socket.on('typing_stop', ({ chatId }) => {
      socket.to(`chat_${chatId}`).emit('typing', {
        userId,
        name: socket.user.name,
        isTyping: false,
        chatId,
      });
    });

    // Message read receipt
    socket.on('messages_read', ({ chatId }) => {
      socket.to(`chat_${chatId}`).emit('messages_read', { userId, chatId });
    });

    // Get online users
    socket.on('get_online_users', () => {
      const onlineUserIds = Array.from(connectedUsers.keys());
      socket.emit('online_users', onlineUserIds);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
      connectedUsers.delete(userId);
      socket.broadcast.emit('user_offline', { userId });
    });
  });

  console.log('✅ Socket.io initialized');
};

const getConnectedUsers = () => connectedUsers;

module.exports = { initSocket, getConnectedUsers };
