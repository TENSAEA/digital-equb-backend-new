const Ticket = require("../models/ticket");

// Create a new ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, createdBy } = req.body;
    const ticket = new Ticket({ title, description, createdBy });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tickets
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tickets of specific user
const getUserTickets = async (req, res) => {
  try {
    const userId = req.params.userId;
    const tickets = await Ticket.find({ createdBy: userId });
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update ticket status (Resolved)
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update ticket answer
const updateTicketAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    ticket.answer.push({
      description: answer,
      createdAt: Date.now(),
    });
    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error updating ticket answer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete ticket by ID
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Update additional description for a ticket
const updateAdditionalDescription = async (req, res) => {
  try {
    const { additionalDescription } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    ticket.additionalDescriptions.push({
      description: additionalDescription,
      createdAt: Date.now(),
    });
    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error updating additional description:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getUserTickets,
  getTicketById,
  updateTicketStatus,
  deleteTicket,
  updateAdditionalDescription,
  updateTicketAnswer,
};
