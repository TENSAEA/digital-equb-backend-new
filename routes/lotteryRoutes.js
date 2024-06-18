const express = require("express");
const {
  createHolidayLottery,
  getAllHolidayLotteries,
  joinHolidayLottery,
} = require("../controllers/lotteryController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/create", authMiddleware, createHolidayLottery);
router.get("/", authMiddleware, getAllHolidayLotteries);
router.post("/:id/join", authMiddleware, joinHolidayLottery);

module.exports = router;
