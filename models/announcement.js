const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  announcement: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
