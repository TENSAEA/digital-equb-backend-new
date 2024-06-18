const Equb = require('../models/equb');
const EqubDraw = require('../models/equbDraw');
const User = require('../models/user');

// Function to get eligible members for a specific equb and current round
const getEligibleMembers = async (req, res) => {
  try {
    const { equbId } = req.params;

    const equb = await Equb.findById(equbId).populate('members'); // Retrieve the Equb with its members

    if (!equb) {
      return res.status(404).json({ message: 'Equb not found' });
    }

    // Retrieve all draws for this equb
    const equbDraws = await EqubDraw.find({ equb: equbId }); // Fetch all draws for this equb
    const winnerIds = equbDraws.map((draw) => draw.winner.toString()); // Collect the winner IDs

    // Find the members who have not won a draw yet
    const eligibleMembers = equb.members.filter(
      (member) => !winnerIds.includes(member._id.toString())
    );

    // Send the response with only the required information
    res.status(200).json({
      message: 'Eligible members retrieved',
      eligibleMembers: eligibleMembers.map((member) => ({
        _id: member._id,
        fname: member.fname,
        lname: member.lname,
      })), // Return only the first and last names of the eligible members
    });
  } catch (error) {
    console.error('Error fetching eligible members:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const storeEqubDraw = async (req, res) => {
  try {
    const { equbId, winnerId } = req.body; // Get equb ID and winner ID from the request

    if (!equbId || !winnerId) {
      console.log("missing required fields");
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Find the specific equb to ensure it exists
    const equb = await Equb.findById(equbId);

    if (!equb) {
      return res.status(404).json({ message: 'Equb not found' });
    }

    // Create a new draw and determine the round number
    const newDraw = new EqubDraw({
      equb: equbId,
      winner: winnerId,
    });

    await newDraw.save(); // Save the new draw

    res.status(201).json({ message: 'Equb draw stored successfully', draw: newDraw });
  } catch (error) {
    console.error('Error storing equb draw:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = {
  getEligibleMembers,
  storeEqubDraw,
};
