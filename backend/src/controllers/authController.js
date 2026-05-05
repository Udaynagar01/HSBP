const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: `This email is already registered as a ${existingUser.role}. Please login or use a different email.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const selectedRole = role === "provider" ? "provider" : "user";

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: selectedRole,
      isApproved: selectedRole === "provider" ? false : true,
    });

    return res.status(201).json({
      message:
        selectedRole === "provider"
          ? "Registered. Waiting for admin approval."
          : "Registered successfully",
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Support both proper bcrypt hashes and legacy plain-text seeded passwords.
    const isHash = typeof user.password === "string" && user.password.startsWith("$2");
    const validPassword = isHash ? await bcrypt.compare(password, user.password) : password === user.password;
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    return res.json({
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const me = async (req, res) => res.json(req.user);

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In production this token would be emailed.
    // For this demo we return it directly so the UI can show the reset link.
    return res.json({
      message: "Password reset token generated. Use it within 1 hour.",
      resetToken: token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate reset token", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

module.exports = { register, login, me, updateProfile, forgotPassword, resetPassword };
