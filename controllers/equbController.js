const Equb = require("../models/equb");
const User = require("../models/user");
const Notification = require("../models/notification");
// Create a new Equb
const createEqub = async (req, res) => {
  try {
    const { name, description, frequency, contributionAmount, StartDate } =
      req.body;

    const adminId = req.user._id; // The authenticated user becomes the Equb admin
    const userRole = req.user.role; // Check the user's role

    // Determine the initial members array based on the user's role
    const members = userRole === "admin" ? [] : [adminId]; // If global admin, keep it empty

    const newEqub = new Equb({
      name,
      description,
      frequency,
      contributionAmount,
      admin: adminId,
      members, // Set based on role
      StartDate,
    });

    await newEqub.save();

    res
      .status(201)
      .json({ message: "Equb created successfully", equb: newEqub });
  } catch (error) {
    console.error("Error creating Equb:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get all equbs created by a specific user
const getUserCreatedEqubs = async (req, res) => {
  try {
    const userId = req.user._id; // Get the ID of the authenticated user
    const equbs = await Equb.find({ admin: userId }); // Find all Equbs created by this user

    res
      .status(200)
      .json({ message: "User-created Equbs fetched successfully", equbs });
  } catch (error) {
    console.error("Error fetching user-created Equbs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all Equbs created by global admins
const getAdminCreatedEqubs = async (req, res) => {
  try {
    // Find all Equbs created by users with the role "admin"
    const adminUsers = await User.find({ role: "admin" });
    const adminIds = adminUsers.map((admin) => admin._id); // Get admin IDs

    const equbs = await Equb.find({ admin: { $in: adminIds } });

    res.status(200).json({ message: "Equbs created by global admins", equbs });
  } catch (error) {
    console.error("Error fetching Equbs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Join an existing Equb
const joinEqub = async (req, res) => {
  try {
    const { equbId } = req.body;
    const userId = req.user._id; // Get the authenticated user ID

    // Find the Equb by its ID
    const equb = await Equb.findById(equbId);

    equb.members.push(userId); // Add the user to the Equb's members
    await equb.save();

    res.status(200).json({ message: "Successfully joined the Equb", equb });
  } catch (error) {
    console.error("Error joining Equb:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get details of an Equb by its ID
const getEqubById = async (req, res) => {
  try {
    const { id } = req.params;
    const equb = await Equb.findById(id).populate(["admin", "members"]);

    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    res.status(200).json({ message: "Equb details", equb });
  } catch (error) {
    console.error("Error getting Equb:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserEqubs = async (req, res) => {
  try {
    const userId = req.user._id;

    const equbs = await Equb.find({ members: userId }).populate([
      "admin",
      "members",
    ]);
    res.status(200).json({ message: "User Equbs", equbs });
  } catch (error) {
    console.error("Error getting user Equbs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an Equb (requires Equb admin)
const updateEqub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, frequency, contributionAmount } = req.body;

    const equb = await Equb.findById(id);

    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Update the Equb details
    equb.name = name || equb.name;
    equb.description = description || equb.description;
    equb.frequency = frequency || equb.frequency;
    equb.contributionAmount = contributionAmount || equb.contributionAmount;

    await equb.save();

    res.status(200).json({ message: "Equb updated", equb });
  } catch (error) {
    console.error("Error updating Equb:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteEqub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const equb = await Equb.findById(id);

    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Ensure the user requesting deletion is the Equb admin
    if (equb.admin.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Access forbidden: You are not the Equb admin" });
    }

    // Mark the Equb as "cancelled"
    equb.status = "cancelled";
    await equb.save();

    // Notify the global admin that the Equb has been marked for deletion
    const globalAdmin = await User.findOne({ role: "admin" }); // Get a global admin
    if (globalAdmin) {
      const notification = new Notification({
        recipient: globalAdmin._id,
        message: `The Equb "${equb.name}" has been marked for deletion by its admin.`,
      });

      await notification.save();
    }

    res.status(200).json({
      message: "Equb marked for deletion. Awaiting admin confirmation.",
      equb,
    });
  } catch (error) {
    console.error("Error deleting Equb:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const confirmDelete = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the user has an admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access forbidden: Admins only" });
    }

    // Find and delete the Equb
    const equb = await Equb.findOneAndDelete({ _id: id });

    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // Find and delete the related notification
    await Notification.findOneAndDelete({
      message: { $regex: equb.name, $options: "i" },
    });

    res.status(200).json({ message: "Equb deleted successfully" });
  } catch (error) {
    console.error("Error confirming deletion:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getEqubMembers = async (req, res) => {
  try {
    const equbId = req.params.equbId;
    const equb = await Equb.findById(equbId).populate("members");
    res.status(200).json({ members: equb.members });
  } catch (error) {
    console.error("Error fetching equb members:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchEqubMembers = async (req, res) => {
  try {
    const { equbId, searchTerm } = req.params;
    const equb = await Equb.findById(equbId).populate({
      path: "members",
      match: {
        $or: [
          { fname: new RegExp(searchTerm, "i") },
          { lname: new RegExp(searchTerm, "i") },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$fname", " ", "$lname"] },
                regex: searchTerm,
                options: "i",
              },
            },
          },
        ],
      },
    });
    res.status(200).json({ members: equb.members });
  } catch (error) {
    console.error("Error searching equb members:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createEqub,
  getUserCreatedEqubs,
  getAdminCreatedEqubs,
  joinEqub,
  getEqubById,
  getUserEqubs,
  updateEqub,
  deleteEqub,
  confirmDelete,
  getEqubMembers,
  searchEqubMembers,
};
