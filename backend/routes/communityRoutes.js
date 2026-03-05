// backend/routes/communityRoutes.js - Community routes
const express = require("express");
const communityController = require("../controllers/communityController");
const { verifyToken } = require("./authRoutes"); // Destructure from exported auth routes

const router = express.Router();

// Protected community routes
router.post("/", verifyToken, communityController.createPost);
router.get("/", verifyToken, communityController.getPosts);

module.exports = router;
