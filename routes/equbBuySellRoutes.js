const express = require("express");
const router = express.Router();
const equbBuySellController = require("../controllers/equbBuySellController");
const authMiddleware = require("../middleware/auth");

// Get all available equbs for sale
router.get("/", authMiddleware, equbBuySellController.getAllEqubsForSale);

// Add a new equb for sale
router.post("/", authMiddleware, equbBuySellController.addEqubForSale);

// Get won equbs for a user
router.get(
  "/user/:userId/wonEqubs",
  authMiddleware,
  equbBuySellController.getWonEqubsForUser
);

module.exports = router;
