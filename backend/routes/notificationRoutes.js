// routes/notificationRoutes.js
const express = require("express");
const { verifyToken } = require("./authRoutes");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.get("/", verifyToken, notificationController.getNotifications);
router.patch(
  "/:id/read",
  verifyToken,
  notificationController.markAsRead
);

module.exports = router;
