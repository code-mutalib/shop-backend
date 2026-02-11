import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  deleteUser,
} from '../controllers/user.controller.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

/* =========================================================
   AUTH ROUTES (PUBLIC)
========================================================= */

/**
 * @route   POST /api/users/auth/register
 * @desc    Register new user (Customer)
 * @access  Public
 */
userRouter.post('/register', registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 * @access  Public
 */
userRouter.post('/login', loginUser);

/* =========================================================
   USER ROUTES (PROTECTED)
========================================================= */

/**
 * @route   GET /api/users/profile
 * @desc    Get logged-in user profile
 * @access  Customer | Admin
 */
userRouter.get(
  '/me',
  authMiddleware(['customer', 'admin']),
  getProfile
);

/* =========================================================
   ADMIN ROUTES (ADMIN ONLY)
========================================================= */

/**
 * @route   GET /api/users/allusers
 * @desc    Get all users
 * @access  Admin
 */
userRouter.get(
  '/',
  authMiddleware(['admin']),
  getAllUsers
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Admin
 */
userRouter.delete(
  '/:id',
  authMiddleware(['admin']),
  deleteUser
);

export default userRouter;
