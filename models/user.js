const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator"); // To validate email and other formats

const UserSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, "First name is required"],
  },
  lname: {
    type: String,
    required: [true, "Last name is required"],
  },
  phone: {
    type: String,
    unique: true,
    required: [true, "Phone number is required"],
  },
  email: {
    type: String,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: "Invalid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"], // Password must be at least 8 characters
    validate: {
      validator: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v), // Requires uppercase, lowercase, and a number
      message:
        "Password must contain at least one uppercase, one lowercase, and one number",
    },
  },
  sex: {
    type: String,
    default: "",
  },
  age: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    default: "user",
  },
  registeredDate: {
    type: Date,
    default: Date.now,
  },
  verificationStatus: {
    type: String,
    default: "not active",
  },
  isBlocked: {
    type: String,
    default: "no",
  },
  profileImage: {
    type: String,
    default: "",
  },
  address: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  verificationExpires: Date,
});

// Pre-save hook to hash the password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // If password is not modified, skip hashing
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
