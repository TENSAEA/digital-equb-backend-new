const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createChat, getChatsBySenderIdAndReceiverId, deleteChat, } = require('../controllers/chatController');
// routes for chat operations
router.post('/create', authMiddleware, createChat);
router.get('/:senderId/:receiverId', authMiddleware, getChatsBySenderIdAndReceiverId);
router.delete('/:chatId', authMiddleware, deleteChat);

module.exports = router;