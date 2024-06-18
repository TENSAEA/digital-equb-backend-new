const mongoose = require("mongoose");

const holidayLotterySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("HolidayLottery", holidayLotterySchema);
