// backend/controllers/communityController.js - Handles community posts

const CommunityPost = require("../models/CommunityPost");
const Notification = require("../models/Notification");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    console.log("COMMUNITY POST BODY:", req.body);

    const { type, title, description, content } = req.body;

    // Validate required fields
    if (!type || !title || (!description && !content)) {
      return res.status(400).json({
        message: "Missing required fields: type, title, description",
      });
    }

    const finalDescription = description || content || "";

    const post = new CommunityPost({
      userId: req.user.id,
      type: type,
      title: title,
      description: finalDescription,
    });

    await post.save();

    // Notify all users or subscribed users
    const usersToNotify = await User.find({}); // TODO: add subscriber filter logic here if needed

    const notifications = usersToNotify.map((user) => ({
      userId: user._id,
      type: "community-post",
      referenceId: post._id,
      text: `New community post: ${post.title}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(post);
  } catch (err) {
    console.error("createPost error:", err);
    res.status(400).json({ message: err.message });
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) {
      // type = 'query' | 'lend' | 'borrow' | 'study-group' etc.
      filter.type = req.query.type;
    }

    const posts = await CommunityPost.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "username");

    res.json(posts);
  } catch (err) {
    console.error("getPosts error:", err);
    res.status(400).json({ message: err.message });
  }
};
