const Notification = require("../models/notification");

// Function to get the count of unread notifications for a specific user
const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id; // Get the ID of the authenticated user

    // Count unread notifications for the specific user
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false, // Only count unread notifications
    });

    res.status(200).json({
      message: "Unread notifications count retrieved",
      count: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to create a new notification
const createNotification = async (req, res) => {
  try {
    const { recipient, message } = req.body;
    const newNotification = new Notification({ recipient, message });

    await newNotification.save();
    res.status(201).json({
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params; // Notification ID from the route
    await Notification.findByIdAndDelete(id); // Delete the notification

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to update a notification (e.g., mark as read)
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params; // Notification ID from the route

    if (!id) {
      return res.status(400).json({ message: "Notification ID is required" }); // Validate input
    }

    // Find and update the notification to mark it as read
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { read: true }, // Mark as read
      { new: true } // Return the updated document
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" }); // Handle not found
    }

    res.status(200).json({
      message: "Notification updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res
      .status(500)
      .json({ message: "Server error while updating notification" }); // General server error
  }
};

// Ensure you are passing a valid user ID when fetching notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?._id; // Ensure the user ID is valid

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Fetch notifications for the specific user
    const notifications = await Notification.find({
      recipient: userId, // Ensure proper ObjectId
    });

    res.status(200).json({ message: "Notifications retrieved", notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to send multiple notifications in one request
const sendMultipleNotifications = async (req, res) => {
  try {
    const { invitations } = req.body; // Array of invitations from the request body
    if (!Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({ message: "Invalid invitations array" });
    }

    const newNotifications = []; // Array to hold new notifications

    // Iterate through each invitation and create a notification
    for (const invitation of invitations) {
      const { recipient, message } = invitation;

      if (!recipient || !message) {
        return res.status(400).json({
          message: "Each invitation must have a recipient and message",
        });
      }

      const notification = new Notification({
        recipient,
        message,
      });

      newNotifications.push(notification); // Add to the array
    }

    // Save all new notifications to the database
    await Notification.insertMany(newNotifications);

    res.status(201).json({
      message: "Notifications sent successfully",
      notifications: newNotifications,
    });
  } catch (error) {
    console.error("Error sending multiple notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendMultipleNotifications,
  getUnreadNotificationCount,
  createNotification,
  deleteNotification,
  updateNotification,
  getUserNotifications,
};
