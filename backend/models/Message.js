// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: false,
    },
    text: { type: String, required: true },

    // sent | delivered | read  (WhatsApp-style)
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
      index: true,
    },

    deliveredAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Fast lookup for conversations between two users
messageSchema.index(
  { senderId: 1, receiverId: 1, createdAt: 1 },
  { name: "conversation_index" }
);

// For unread counts
messageSchema.index(
  { receiverId: 1, status: 1, createdAt: -1 },
  { name: "inbox_unread_index" }
);

module.exports = mongoose.model("Message", messageSchema);
