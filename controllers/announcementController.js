const Announcement = require("../models/announcement");
const User = require("../models/user"); // Import the User model
const Notification = require("../models/notification"); // Import the Notification model

// Function to create a new announcement
const createAnnouncement = async (req, res) => {
  try {
    const { announcement } = req.body;
    const newAnnouncement = new Announcement({ announcement });
    await newAnnouncement.save();

    // Fetch all users
    const users = await User.find();

    // Create notifications for each user
    const notifications = users.map((user) => ({
      recipient: user._id,
      message: `New announcement: ${announcement}`,
    }));

    // Save notifications to the database
    await Notification.insertMany(notifications);

    res.status(201).json({
      message: "Announcement created successfully",
      announcement: newAnnouncement,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to get all announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdDate: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error getting announcements:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createAnnouncement, getAnnouncements };
