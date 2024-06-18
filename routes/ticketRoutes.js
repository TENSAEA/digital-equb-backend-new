const express = require("express");
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getUserTickets,
  getTicketById,
  updateTicketStatus,
  deleteTicket,
  updateAdditionalDescription,
  updateTicketAnswer,
} = require("../controllers/ticketController");
const authMiddleware = require("../middleware/auth");

// Create a new ticket
router.post("/create", authMiddleware, createTicket);

// Get all tickets
router.get("/all", authMiddleware, getAllTickets);

// Get tickets by user ID
router.get("/user/:userId", authMiddleware, getUserTickets);

// Get ticket by ID
router.get("/:id", authMiddleware, getTicketById);

// Update ticket status
router.patch("/:id/update-status", authMiddleware, updateTicketStatus);
router.patch("/:id/reply", updateTicketAnswer);

// Update additional description
router.patch(
  "/:id/update-additional-description",
  authMiddleware,
  updateAdditionalDescription
);

// Delete ticket
router.delete("/:id", authMiddleware, deleteTicket);

module.exports = router;
