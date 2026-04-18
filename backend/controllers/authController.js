const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, regno, dept, year } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      regno,
      dept,
      year
    });

    await user.save();

    res.json({ message: "Registered successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔑 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};