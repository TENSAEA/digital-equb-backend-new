const express = require("express");
const path = require("path");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const {
  signup,
  login,
  getUsersByName,
  getAllUsers,
  updateUserDetails,
  updateUserPassword,
  updateUserProfilePicture,
  getUserProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save uploaded files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.verificationStatus = "active";
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/signup", signup);
router.post("/login", login);
router.get("/search/:name", authMiddleware, getUsersByName); // Route to search for users by name
router.get("/search-all", authMiddleware, getAllUsers);
router.put("/details", authMiddleware, updateUserDetails);
router.put("/password", authMiddleware, updateUserPassword);
router.put(
  "/profile-picture",
  authMiddleware,
  upload.single("profileImage"),
  updateUserProfilePicture
);
router.put("/profile", authMiddleware, getUserProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
