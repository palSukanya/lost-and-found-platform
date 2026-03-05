const express = require("express");
const authController = require("../controllers/authController");
const jwt = require("jsonwebtoken");

const router = express.Router();

// JWT middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.getProfile);

// Export router only
module.exports = router;

// Export middleware separately
module.exports.verifyToken = verifyToken;
