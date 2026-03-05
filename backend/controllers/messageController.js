// controllers/messageController.js
const User = require("../models/User");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

/**
 * POST /api/messages
 * Body: { receiverId?: string, receiverUsername?: string, text: string, itemId?: string }
 */
exports.sendMessage = async (req, res) => {
  try {
    let { receiverId, receiverUsername, text, itemId } = req.body;

    if (!receiverId && receiverUsername) {
      const user = await User.findOne({ username: receiverUsername });
      if (!user) return res.status(404).json({ message: "Receiver not found" });
      receiverId = user._id.toString();
    }

    if (!receiverId) {
      return res
        .status(400)
        .json({ message: "receiverId or receiverUsername is required" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      text: text.trim(),
      itemId: itemId || undefined,
      status: "sent",
    });

    // Notification for receiver
    const notification = await Notification.create({
      userId: receiverId,
      type: "new-message",
      referenceId: message._id,
      text: `New message from ${req.user.username}`,
    });

    // Real-time via socket.io (if configured)
    const io = req.app.get("io");
    if (io) {
      io.to(receiverId.toString()).emit("new-message", {
        message,
      });
      io.to(receiverId.toString()).emit("notification", {
        notification,
      });
    }

    res.status(201).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: err.message || "Failed to send message" });
  }
};

/**
 * GET /api/messages
 * Returns all messages where user is sender or receiver, newest first.
 */
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: 1 })
      .populate("senderId receiverId", "username");

    // Mark all previously 'sent' messages TO this user as 'delivered'
    await Message.updateMany(
      { receiverId: userId, status: "sent" },
      { $set: { status: "delivered", deliveredAt: new Date() } }
    );

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/messages/conversation?otherUser=<username or id>
 * Fetch only the thread between current user and another user.
 */
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    let { otherUser, by } = req.query; // by = "username" | "id"

    if (!otherUser) {
      return res
        .status(400)
        .json({ message: "otherUser query param is required" });
    }

    let otherUserId = otherUser;

    if (by === "username") {
      const u = await User.findOne({ username: otherUser });
      if (!u) return res.status(404).json({ message: "User not found" });
      otherUserId = u._id.toString();
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId receiverId", "username");

    // Mark unread in this conversation as delivered
    await Message.updateMany(
      {
        receiverId: userId,
        senderId: otherUserId,
        status: "sent",
      },
      { $set: { status: "delivered", deliveredAt: new Date() } }
    );

    res.json(messages);
  } catch (err) {
    console.error("getConversation error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/messages/read
 * Body: { otherUserId?: string, otherUsername?: string }
 * Mark all messages from otherUser -> me as 'read'
 */
exports.markConversationRead = async (req, res) => {
  try {
    const me = req.user.id;
    let { otherUserId, otherUsername } = req.body;

    if (!otherUserId && otherUsername) {
      const u = await User.findOne({ username: otherUsername });
      if (!u) return res.status(404).json({ message: "User not found" });
      otherUserId = u._id.toString();
    }

    if (!otherUserId) {
      return res
        .status(400)
        .json({ message: "otherUserId or otherUsername is required" });
    }

    const now = new Date();

    const result = await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: me,
        status: { $ne: "read" },
      },
      { $set: { status: "read", readAt: now, deliveredAt: now } }
    );

    // Optionally: notify sender about read-receipt
    const io = req.app.get("io");
    if (io && result.modifiedCount > 0) {
      io.to(otherUserId.toString()).emit("conversation-read", {
        by: me,
        otherUserId: me,
      });
    }

    res.json({ updated: result.modifiedCount });
  } catch (err) {
    console.error("markConversationRead error:", err);
    res.status(500).json({ message: err.message });
  }
};
