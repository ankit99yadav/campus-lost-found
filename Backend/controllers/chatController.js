const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Item = require('../models/Item');

// @desc    Start or get existing chat
// @route   POST /api/chat/start
// @access  Private
const startChat = async (req, res, next) => {
  try {
    const { participantId, itemId } = req.body;

    if (!participantId) {
      return res.status(400).json({ success: false, message: 'Participant ID is required.' });
    }

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot start chat with yourself.' });
    }

    // Check if chat already exists between these two users for this item
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] },
      relatedItem: itemId || null,
      isActive: true,
    }).populate('participants', 'name avatar email').populate('relatedItem', 'title type');

    if (existingChat) {
      return res.json({ success: true, chat: existingChat, isExisting: true });
    }

    // Create new chat
    const chat = await Chat.create({
      participants: [req.user._id, participantId],
      relatedItem: itemId || null,
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name avatar email department')
      .populate('relatedItem', 'title type category images');

    // Notify the other participant
    const io = req.app.get('io');
    const notification = await Notification.create({
      recipient: participantId,
      type: 'new_message',
      title: '💬 New Chat Started',
      message: `${req.user.name} wants to chat with you${itemId ? ' about an item' : ''}.`,
      data: { chatId: chat._id, userId: req.user._id, itemId },
    });

    if (io) io.to(`user_${participantId}`).emit('notification', notification);

    res.status(201).json({ success: true, chat: populatedChat });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate('participants', 'name avatar email department isActive')
      .populate('relatedItem', 'title type category status images')
      .populate('lastMessage', 'content type createdAt sender')
      .sort({ lastMessageAt: -1 })
      .lean();

    res.json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a chat
// @route   GET /api/chat/:chatId/messages
// @access  Private
const getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });

    // Verify user is participant
    if (!chat.participants.map(String).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.find({ chat: chatId, isDeleted: false })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Mark messages as read
    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, $push: { readBy: { user: req.user._id } } }
    );

    // Reset unread count for this user
    const unreadCount = chat.unreadCount || new Map();
    unreadCount.set(req.user._id.toString(), 0);
    await Chat.findByIdAndUpdate(chatId, { unreadCount });

    res.json({
      success: true,
      messages: messages.reverse(),
      chatId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content && !req.file) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });

    if (!chat.participants.map(String).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const messageData = {
      chat: chatId,
      sender: req.user._id,
      content: content || '',
      type: req.file ? 'image' : 'text',
    };

    if (req.file) {
      messageData.image = { url: req.file.path, public_id: req.file.filename };
      messageData.content = content || 'Image';
    }

    const message = await Message.create(messageData);
    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

    // Update chat's last message and unread count
    const otherParticipants = chat.participants.filter(p => p.toString() !== req.user._id.toString());
    const unreadCount = chat.unreadCount || new Map();
    for (const p of otherParticipants) {
      unreadCount.set(p.toString(), (unreadCount.get(p.toString()) || 0) + 1);
    }

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      unreadCount,
    });

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`chat_${chatId}`).emit('new_message', populatedMessage);
      // Notify other participants
      for (const p of otherParticipants) {
        io.to(`user_${p}`).emit('chat_update', { chatId, message: populatedMessage });
      }
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    next(error);
  }
};

module.exports = { startChat, getMyChats, getChatMessages, sendMessage };
