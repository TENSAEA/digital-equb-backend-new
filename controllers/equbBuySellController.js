const EqubBuySell = require("../models/equbBuySell");
const EqubDraw = require("../models/equbDraw"); // Assume this model exists

// Controller function to get all available equbs for sale
exports.getAllEqubsForSale = async (req, res) => {
  try {
    const equbsForSale = await EqubBuySell.find({
      expiredDate: { $gt: new Date() },
    });
    res.json(equbsForSale);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Controller function to add a new equb for sale
exports.addEqubForSale = async (req, res) => {
  const { equbDrawId, paymentMethod } = req.body;
  try {
    const newEqub = new EqubBuySell({
      equbDrawId,
      paymentMethod,
    });
    await newEqub.save();
    res.status(201).json(newEqub);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Controller function to get won equbs for a user
exports.getWonEqubsForUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const wonEqubs = await EqubDraw.find({ winner: userId }).populate("equb");
    res.json(wonEqubs);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
