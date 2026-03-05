// authController.js - Handles authentication logic
const User = require("../models/User");
const jwt = require("jsonwebtoken");

/* ================================
   REGISTER USER
================================ */
exports.register = async (req, res) => {
  let { username, email, password } = req.body;

  try {
    // Normalize email
    email = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({ token });

  } catch (err) {
    console.error("Register Error:", err);

    res.status(400).json({
      message: err.message || "Registration failed",
    });
  }
};

/* ================================
   LOGIN USER
================================ */
exports.login = async (req, res) => {
  let { email, password } = req.body;

  try {
    // Normalize email
    email = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });

  } catch (err) {
    console.error("Login Error:", err);

    res.status(500).json({
      message: "Server error during login",
    });
  }
};

/* ================================
   GET USER PROFILE
================================ */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);

  } catch (err) {
    console.error("Get Profile Error:", err);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};
