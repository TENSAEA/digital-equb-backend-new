const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
  createAnnouncement,
  getAnnouncements,
} = require("../controllers/announcementController");

const router = express.Router();

// Route to create a new announcement
router.post("/", authMiddleware, createAnnouncement);

// Route to get all announcements
router.get("/", authMiddleware, getAnnouncements);

module.exports = router;
