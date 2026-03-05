// controllers/notificationController.js
const Notification = require("../models/Notification");

/**
 * GET /api/notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(notifications);
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: err.message });
  }
};
