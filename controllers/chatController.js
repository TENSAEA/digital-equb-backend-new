const mongoose = require('mongoose');
const Chat = require('../models/chat');

// Controller functions for chat operations

// Function to get chats by senderId and receiverId
const getChatsBySenderIdAndReceiverId = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const chats = await Chat.find({
      $or: [
        { senderId: new mongoose.Types.ObjectId(senderId), receiverId: new mongoose.Types.ObjectId(receiverId) },
        { senderId: new mongoose.Types.ObjectId(receiverId), receiverId: new mongoose.Types.ObjectId(senderId) }
      ]
    }).sort({ createdAt: 1 }); // Sorting by creation time to display in order

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Error fetching chats' });
  }
};

// Function to create a new chat
const createChat = async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    const newChat = new Chat({
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      message,
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Error creating chat' });
  }
};
const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createChat,
  getChatsBySenderIdAndReceiverId,
  deleteChat,
};
