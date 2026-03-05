const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* Get Profile */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* Update Profile */
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, phone } = req.body;

    const user = await User.findById(req.user.id);

    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      message: "Profile updated",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* Change Password */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Password change failed" });
  }
};

/* Upload Avatar */
exports.uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    const user = await User.findById(req.user.id);

    user.avatar = avatar;
    await user.save();

    res.json({
      message: "Avatar updated",
      avatar,
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};
