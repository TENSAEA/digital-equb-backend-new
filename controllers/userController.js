const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const signup = async (req, res) => {
  try {
    const { fname, lname, phone, email, password, verificationStatus } =
      req.body;

    // Ensure required fields are provided
    if (!fname || !lname || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if phone or email already exists
    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    if (email) {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res
          .status(400)
          .json({ message: "Email address already exists" });
      }
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");

    // Create new user
    const user = new User({
      fname,
      lname,
      phone,
      email,
      password,
      verificationToken,
      verificationExpires: Date.now() + 3600000, // 1 hour
      verificationStatus,
    });
    await user.save();

    // Send verification email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Email Verification",
      text: `Please verify your email by clicking on this link: http://localhost:3000/verify/${verificationToken}`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error("There was an error: ", err);
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(201).json({
        message: "User created successfully. Please verify your email.",
        user: { fname: user.fname, lname: user.lname, email: user.email },
        token,
      });
    });
    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: "User created successfully",
      user: { fname: user.fname, lname: user.lname, email: user.email },
      token,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Extract the message from the error object
      const messages = Object.values(error.errors).map((val) => val.message);

      // Send a response with a 400 status code and the validation messages
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
  }
};

const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Find user by email or phone number
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.status(400).json({ message: "Wrong email or phone number!" });
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Wrong password!" });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        profileImage: user.profileImage,
        age: user.age,
        sex: user.sex,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to get users by their fname, or fname and lname with/without space
const getUsersByName = async (req, res) => {
  try {
    const { name } = req.params; // Get the search term from request parameters

    if (!name) {
      return res.status(400).json({ message: "Name parameter is required" }); // Validate input
    }

    // Build a regex to match the first name or the concatenated first and last name
    const nameRegex = new RegExp(name, "i");

    // Find users whose first name, last name, or concatenated name matches the regex
    const users = await User.find({
      $or: [
        { fname: nameRegex }, // Match first name
        { lname: nameRegex }, // Match last name
        { fullName: nameRegex }, // Optional: Create a 'fullName' field that concatenates fname and lname
      ],
    });

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found with the given name" });
    }

    res.status(200).json({ message: "Users found", users }); // Return the matching users
  } catch (error) {
    console.error("Error fetching users by name:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Function to fetch all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field from the response
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateUserDetails = async (req, res) => {
  try {
    const { fname, lname, email, phone, sex, age, address } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fname, lname, email, phone, sex, age, address },
      { new: true }
    );
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password matches
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the filename of the uploaded file
    const profileImage = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    );
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Forgot Password Handler
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             http://localhost:3000/reset-password/${token}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error("There was an error: ", err);
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({ message: "Password reset email sent" });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password Handler
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    user.password = password; // This triggers the pre-save hook to hash the password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};
