const Request = require("../models/request");
const User = require("../models/user");
const Equb = require("../models/equb");
const Notification = require("../models/notification");

const getUserRequests = async (req, res) => {
  try {
    const equbId = req.params.equbId;
    const requests = await Request.find({ equbId: equbId });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user requests" });
  }
};
const createRequest = async (req, res) => {
  try {
    const { senderId, equbId, equbAdminId, message } = req.body;

    const newRequest = new Request({
      senderId,
      equbId,
      equbAdminId,
      message,
    });
    const equb = await Equb.findById(equbId);
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    if (equb.members.includes(senderId)) {
      return res
        .status(400)
        .json({ message: "You are already a member of this Equb" });
    }

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ error: "Failed to create request" });
  }
};

const approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: "approved" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const equb = await Equb.findById(request.equbId);
    if (!equb) {
      return res.status(404).json({ error: "Equb not found" });
    }

    equb.members.push(request.senderId);
    await equb.save();

    // Create a notification
    const notification = new Notification({
      recipient: request.senderId,
      message: "Your request has been approved.",
    });
    await notification.save();

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to approve request" });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await Request.findByIdAndDelete(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete request" });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: "rejected" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Create a notification
    const notification = new Notification({
      recipient: request.senderId,
      message: "Your request has been rejected.",
    });
    await notification.save();

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject request" });
  }
};

module.exports = {
  getUserRequests,
  createRequest,
  approveRequest,
  rejectRequest,
  deleteRequest,
};
