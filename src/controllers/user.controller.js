import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

/* Validate Email Format */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/* Validate Password Strength (Minimum 6 chars) */
const isStrongPassword = (password) => {
  return password && password.length >= 6;
};

/* Sanitize User Output */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

/* =========================================================
   REGISTER USER
========================================================= */

export const registerUser = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    /* ================= VALIDATION ================= */

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    email = email.toLowerCase().trim();

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    /* ================= CHECK EXISTING USER ================= */

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    /* ================= HASH PASSWORD ================= */

    const hashedPassword = await bcrypt.hash(password, 12);

    /* ================= CREATE USER ================= */

    const user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      role: 'customer', // Public registration always customer
    });

    /* ================= GENERATE TOKEN ================= */

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   LOGIN USER
========================================================= */

export const loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    /* ================= VALIDATION ================= */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    email = email.toLowerCase().trim();

    /* ================= FIND USER ================= */

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    /* ================= VERIFY PASSWORD ================= */

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    /* ================= GENERATE TOKEN ================= */

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET PROFILE (AUTH REQUIRED)
========================================================= */

export const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ALL USERS (ADMIN ONLY)
========================================================= */

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE USER (ADMIN ONLY)
========================================================= */

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
