// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // 'claim-pending' | 'claim-approved' | 'claim-rejected'
    // 'claim-submitted' | 'claim-completed'
    // 'new-message' | 'community-post'
    // 'item-claimed'
    type: { type: String, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
