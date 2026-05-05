const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Booking = require("../models/Booking");

const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

const setProviderApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const provider = await User.findById(id);

    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.isApproved = !!isApproved;
    await provider.save();

    res.json({ message: "Provider status updated", provider });
  } catch (error) {
    res.status(500).json({ message: "Failed to update provider", error: error.message });
  }
};

const getAllBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("provider", "name email")
      .populate("service", "title category price");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: `Password updated for ${user.name} (${user.email})` });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};

module.exports = { getAllUsers, setProviderApproval, getAllBookings, changeUserPassword };
