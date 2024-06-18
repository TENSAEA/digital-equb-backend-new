const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const equbBuySellSchema = new Schema({
  equbDrawId: { type: Schema.Types.ObjectId, ref: "EqubDraw", required: true },
  paymentMethod: {
    type: {
      type: String,
      enum: ["CBE", "Abyssinia Bank", "Dashen Bank", "Abay Bank", "Telebirr"],
      required: true,
    },
    value: { type: String, required: true },
  },
  date: { type: Date, default: Date.now },
  expiredDate: { type: Date },
});

equbBuySellSchema.pre("save", function (next) {
  const equbDrawDate = this.date; // You need to replace this with the actual draw date
  const isWeekly = true; // Replace with actual check
  if (isWeekly) {
    this.expiredDate = new Date(
      equbDrawDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
  }
  next();
});

module.exports = mongoose.model("EqubBuySell", equbBuySellSchema);
