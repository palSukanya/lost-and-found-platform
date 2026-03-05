// CommunityPost.js - Model for community board posts
const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'textbook', 'study group'
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: { type: Number, default: 0 },
  comments: [{ text: String, userId: mongoose.Schema.Types.ObjectId }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);
