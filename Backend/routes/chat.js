const express = require('express');
const router = express.Router();
const { startChat, getMyChats, getChatMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { uploadChatImage } = require('../config/cloudinary');

router.use(protect);

router.post('/start', startChat);
router.get('/', getMyChats);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/messages', uploadChatImage.single('images'), sendMessage);

module.exports = router;
