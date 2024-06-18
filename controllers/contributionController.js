const Contribution = require("../models/contribution");
const EqubDraw = require("../models/equbDraw"); // Import EqubDraw model
const axios = require("axios");

let processingPayments = {};

exports.paymentCallback = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    if (processingPayments[tx_ref]) {
      return res.status(400).json({ message: "Payment already in process" });
    }

    processingPayments[tx_ref] = true;

    if (status === "success") {
      const [equbId, userId] = tx_ref.split("-").slice(1, 3);
      const equbDraw = await EqubDraw.findOne({ equbId }).sort({ round: -1 });
      const currentRound = equbDraw ? equbDraw.round : 1;

      const newContribution = new Contribution({
        equbId,
        userId,
        round: currentRound,
      });
      await newContribution.save();

      delete processingPayments[tx_ref];
      return res
        .status(200)
        .json({ message: "Payment successful and contribution recorded" });
    } else {
      delete processingPayments[tx_ref];
      return res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    delete processingPayments[tx_ref];
    console.error("Error handling payment callback:", error);
    return res
      .status(500)
      .json({ message: "Error handling payment callback", error });
  }
};

exports.createContribution = async (req, res) => {
  try {
    const { equbId, userId, amount } = req.body;
    const newContribution = new Contribution({ equbId, userId, amount });
    await newContribution.save();
    res.status(201).json(newContribution);
  } catch (error) {
    console.error("Error creating contribution:", error);
    res.status(500).json({ message: "Error creating contribution", error });
  }
};

exports.getContributionsByEqub = async (req, res) => {
  try {
    const contributions = await Contribution.find({
      equbId: req.params.equbId,
    });
    res.status(200).json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({ message: "Error fetching contributions", error });
  }
};

exports.initiatePayment = async (req, res) => {
  try {
    const { equbId, userId, amount, email } = req.body;

    const tx_ref = `equb-${equbId}-${userId}-${Date.now()}`;
    const chapaResponse = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        tx_ref,
        return_url: `http://localhost:3000/payment/success?tx_ref=${tx_ref}`,
      },
      {
        headers: {
          Authorization: `Bearer CHASECK_TEST-TRrT3Xeh0DDvrMf4FVBHsTUF38bWukfl`,
        },
      }
    );

    const { data } = chapaResponse;
    res.status(200).json({ paymentUrl: data.data.checkout_url });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({
      message: "Error initiating payment",
      error: error.response.data,
    });
  }
};

exports.checkContribution = async (req, res) => {
  try {
    const { equbId, userId } = req.body;

    const existingContribution = await Contribution.findOne({
      equbId,
      userId,
    }).sort({ date: -1 });

    const equbDraw = await EqubDraw.findOne({ equbId }).sort({ round: -1 });
    const currentRound = equbDraw ? equbDraw.round : 1;

    if (existingContribution && existingContribution.round >= currentRound) {
      return res.status(200).json({
        message: "You have already contributed for the current round.",
      });
    } else {
      return res
        .status(200)
        .json({ message: "You can contribute for the current round." });
    }
  } catch (error) {
    console.error("Error checking contribution:", error);
    return res
      .status(500)
      .json({ message: "Error checking contribution", error });
  }
};
exports.getContributionsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const contributions = await Contribution.find({ userId });
    res.status(200).json(contributions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user contributions" });
  }
};
exports.deleteContribution = async (req, res) => {
  try {
    const contributionId = req.params.id;
    const deletedContribution = await Contribution.findByIdAndDelete(
      contributionId
    );
    if (!deletedContribution) {
      return res.status(404).json({ error: "Contribution not found" });
    }
    res.status(200).json({ message: "Contribution deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contribution" });
  }
};
