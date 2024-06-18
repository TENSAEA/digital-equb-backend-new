const mongoose = require('mongoose');

// Define the EqubDraw schema
const EqubDrawSchema = new mongoose.Schema({
  equb: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equb', // Reference to the Equb this draw belongs to
    required: true,
  },
  round: {
    type: Number, // The round number for the draw
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who won the draw
    required: true,
  },
  date: {
    type: Date, // The date of the draw
    default: Date.now, // Default to the current date
  },
});

// Middleware to auto-increment the round number based on the equb
EqubDrawSchema.pre('save', async function (next) {
  const equbId = this.equb;

  try {
    // Get the latest draw for this equb and determine the next round number
    const latestDraw = await EqubDraw.findOne({ equb: equbId })
      .sort({ round: -1 }) // Sort in descending order to get the latest round
      .exec();

    if (latestDraw) {
      this.round = latestDraw.round + 1; // Increment the round number
    } else {
      this.round = 1; // If no draw exists, set the first round
    }

    next(); // Continue to save the document
  } catch (error) {
    next(error); // Pass error to the next middleware
  }
});

// Create the model from the schema
const EqubDraw = mongoose.model('EqubDraw', EqubDrawSchema);

module.exports = EqubDraw; // Export the model
