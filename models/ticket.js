const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  additionalDescriptions: {
    type: [{
      description: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    default: [],
  },
  status: { type: String, default: 'Open' },
  answer: {
    type: [{
      description: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    default: [],
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
