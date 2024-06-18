const HolidayLottery = require("../models/lottery");

exports.createHolidayLottery = async (req, res) => {
  const { name, description } = req.body;
  const adminId = req.user._id;

  try {
    const newLottery = new HolidayLottery({
      name,
      description,
      admin: adminId,
    });

    await newLottery.save();

    res
      .status(201)
      .json({
        message: "Holiday lottery created successfully",
        lottery: newLottery,
      });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getAllHolidayLotteries = async (req, res) => {
  try {
    const lotteries = await HolidayLottery.find().populate("admin", "username");
    res.json(lotteries);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.joinHolidayLottery = async (req, res) => {
  const lotteryId = req.params.id;
  const userId = req.user._id;

  try {
    const lottery = await HolidayLottery.findById(lotteryId);
    if (!lottery) {
      return res.status(404).json({ message: "Lottery not found" });
    }

    lottery.members.push(userId);
    await lottery.save();

    res.json({ message: "Joined the lottery successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
