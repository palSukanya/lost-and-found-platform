// routes/messageRoutes.js
const express = require("express");
const { verifyToken } = require("./authRoutes");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.post("/", verifyToken, messageController.sendMessage);
router.get("/", verifyToken, messageController.getMessages);
router.get(
  "/conversation",
  verifyToken,
  messageController.getConversation
);
router.patch(
  "/read",
  verifyToken,
  messageController.markConversationRead
);

module.exports = router;
