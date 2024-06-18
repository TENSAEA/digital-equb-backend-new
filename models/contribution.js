const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  equbId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equb',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  round: {
    type: Number,
    required: true
  }
});

const Contribution = mongoose.model('Contribution', contributionSchema);

module.exports = Contribution;
