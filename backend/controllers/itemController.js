// controllers/itemController.js
const Item = require("../models/Item");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ✅ Create new Item
exports.createItem = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      category,
      location,
      verificationQuestions,
      reward,
      timeLost,
      timeFound,
    } = req.body;

    if (!type || !title || !description || !category) {
      return res.status(400).json({
        message: "Missing required fields: type, title, description, category",
      });
    }

    // ✅ Parse verification questions (FormData sends as JSON string)
    let questions = [];
    if (verificationQuestions) {
      try {
        questions = JSON.parse(verificationQuestions);
        if (!Array.isArray(questions)) questions = [];
      } catch (e) {
        questions = [];
      }
    }

    const item = new Item({
      type,
      title,
      description,
      category,
      location,
      // ✅ Cloudinary URL stored
      image: req.file ? req.file.path : null,
      verificationQuestions: questions,
      reward,
      timeLost,
      timeFound,
      userId: req.user.id,
      status: "open",
    });

    await item.save();
    return res.status(201).json(item);
  } catch (err) {
    console.error("Item creation error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// ✅ Get items
exports.getItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    // FOUND PAGE ONLY SHOWS OPEN ITEMS FOR PUBLIC
    if (req.query.type === "found") {
      // NOTE: In your app verifyToken is required for getItems,
      // so req.user always exists. Still keeping logic safe.
      if (!req.user) {
        filter.status = "open";
      } else {
        filter.$or = [{ status: "open" }, { userId: req.user.id }];
      }
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "username id")
      .lean();

    return res.json(items);
  } catch (err) {
    console.error("getItems error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// ✅ Step 1: submit claim
exports.submitClaim = async (req, res) => {
  try {
    const { itemId, claimAnswers } = req.body;

    if (!itemId || !Array.isArray(claimAnswers) || claimAnswers.length === 0) {
      return res.status(400).json({
        message: "Missing itemId or claimAnswers",
      });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.status !== "open") {
      return res
        .status(400)
        .json({ message: `Item is ${item.status}, cannot claim` });
    }

    const message = new Message({
      senderId: req.user.id,
      receiverId: item.userId,
      itemId,
      text: `CLAIM REQUEST: ${req.user.username} wants to claim "${item.title}"\n\nVerification Answers:\n${claimAnswers
        .map((ans, i) => `${i + 1}. ${ans}`)
        .join("\n")}\n\nPlease verify and respond to arrange pickup!`,
    });

    await message.save();

    item.status = "pending";
    await item.save();

    await Notification.create({
      userId: item.userId,
      type: "claim-pending",
      referenceId: item._id,
      text: `Claim request for "${item.title}" - ${req.user.username} answered verification questions. Please review in Messages.`,
    });

    await Notification.create({
      userId: req.user.id,
      type: "claim-submitted",
      referenceId: item._id,
      text: `Your claim for "${item.title}" is pending. Finder will review your answers in Messages.`,
    });

    return res.status(201).json({
      message: "Claim submitted successfully! Finder notified with your answers.",
      item: { id: item._id, status: item.status },
    });
  } catch (error) {
    console.error("submitClaim error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ✅ Step 2: approve claim
exports.approveClaim = async (req, res) => {
  try {
    const itemId = req.body.itemId || req.params.id;

    const item = await Item.findById(itemId).populate("userId", "username id");
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.userId._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the finder can approve claims" });
    }

    if (item.status !== "pending") {
      return res
        .status(400)
        .json({ message: 'Item must be in "pending" status to approve' });
    }

    item.status = "claimed";
    await item.save();

    const claimantMessage = await Message.findOne({
      itemId: item._id,
      receiverId: item.userId._id,
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "username id");

    if (claimantMessage?.senderId) {
      await Notification.create({
        userId: claimantMessage.senderId._id,
        type: "claim-approved",
        referenceId: item._id,
        text: `✅ "${item.title}" CLAIM APPROVED! Contact ${item.userId.username} to pickup your item.`,
      });
    }

    await Notification.create({
      userId: item.userId._id,
      type: "claim-completed",
      referenceId: item._id,
      text: `✅ "${item.title}" claim completed and marked as delivered!`,
    });

    return res.json({
      message:
        "✅ Claim APPROVED! Item marked CLAIMED and removed from Found page.",
      item: { id: item._id, status: item.status, title: item.title },
    });
  } catch (error) {
    console.error("approveClaim error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Step 3: reject claim
exports.rejectClaim = async (req, res) => {
  try {
    const itemId = req.body.itemId || req.params.id;

    const item = await Item.findById(itemId).populate("userId", "username id");
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.userId._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the finder can reject claims" });
    }

    if (item.status !== "pending") {
      return res
        .status(400)
        .json({ message: 'Item must be in "pending" status to reject' });
    }

    item.status = "open";
    await item.save();

    const claimantMessage = await Message.findOne({
      itemId: item._id,
      receiverId: item.userId._id,
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "username id");

    if (claimantMessage?.senderId) {
      await Notification.create({
        userId: claimantMessage.senderId._id,
        type: "claim-rejected",
        referenceId: item._id,
        text: `❌ Your claim for "${item.title}" was rejected by ${item.userId.username}.`,
      });
    }

    await Notification.create({
      userId: item.userId._id,
      type: "claim-pending",
      referenceId: item._id,
      text: `Claim for "${item.title}" was rejected and item is open again.`,
    });

    const io = req.app.get("io");
    if (io && claimantMessage?.senderId) {
      io.to(claimantMessage.senderId._id.toString()).emit("notification", {
        type: "claim-rejected",
        itemId: item._id,
      });
    }

    return res.json({
      message: "Claim rejected, item reopened.",
      item: { id: item._id, status: item.status },
    });
  } catch (error) {
    console.error("rejectClaim error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Simple claim
exports.claimItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.status === "claimed") {
      return res.status(400).json({ message: "Item already claimed" });
    }

    item.status = "claimed";
    await item.save();

    await Notification.create({
      userId: item.userId,
      type: "item-claimed",
      referenceId: item._id,
      text: `Your ${item.type} item "${item.title}" has been claimed!`,
    });

    return res.json({ message: "Item claimed successfully", item });
  } catch (err) {
    console.error("claimItem error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Send message
exports.sendMessage = async (req, res) => {
  try {
    let receiverId = req.body.receiverId;

    if (req.body.receiverUsername) {
      const user = await User.findOne({ username: req.body.receiverUsername });
      if (!user)
        return res.status(404).json({ message: "Receiver not found" });
      receiverId = user.id;
    }

    if (!receiverId) {
      return res
        .status(400)
        .json({ message: "ReceiverId or Username required" });
    }

    const message = new Message({
      senderId: req.user.id,
      receiverId,
      text: req.body.text || req.body.message,
    });

    await message.save();

    await Notification.create({
      userId: receiverId,
      type: "new-message",
      referenceId: message.id,
      text: `New message from ${req.user.username}`,
    });

    return res.status(201).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(400).json({ message: err.message });
  }
};
