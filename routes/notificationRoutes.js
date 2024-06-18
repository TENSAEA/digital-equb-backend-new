const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  sendMultipleNotifications,
  getUnreadNotificationCount,
  createNotification,
  deleteNotification,
  updateNotification,
  getUserNotifications,
} = require('../controllers/notificationController');

const router = express.Router();
// Route to get the count of unread notifications for the authenticated user
router.get('/unread-count', authMiddleware, getUnreadNotificationCount);
// Create a new notification
router.post('/create', authMiddleware, createNotification);
// Route to send multiple notifications
router.post('/many', authMiddleware, sendMultipleNotifications); // Ensure this requires authentication

// Delete a notification by its ID
router.delete('/delete/:id', authMiddleware, deleteNotification);

// Update a notification by its ID
router.put('/update/:id', authMiddleware, updateNotification);

// Get all notifications for a specific user
router.get('/user/:userId', authMiddleware, getUserNotifications);

module.exports = router;
