import User from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Authorization Middleware
 * @param {Array} allowedRoles - Roles allowed to access route
 */
export const authMiddleware = (allowedRoles = ['customer', 'admin']) => {
  return async (req, res, next) => {
    try {
      /* ================= TOKEN CHECK ================= */
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: 'Access denied: No token provided',
        });
      }

      const token = authHeader.split(' ')[1];

      /* ================= VERIFY TOKEN ================= */
      let decoded;
      try {
        decoded = verifyToken(token);
      } catch (err) {
        return res.status(401).json({
          message:
            err.message === 'jwt expired' ? 'Token expired' : 'Invalid token',
        });
      }

      /* ================= ROLE CHECK (TOKEN LEVEL) ================= */
      if (!decoded.role || !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          message: 'Access denied: Insufficient permissions',
        });
      }

      /* ================= USER CHECK (DATABASE LEVEL) ================= */
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          message: 'User not found',
        });
      }

      /* ================= ROLE VALIDATION (DB SAFETY CHECK) ================= */
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: 'Access denied: Role mismatch',
        });
      }

      /* ================= ATTACH USER ================= */
      req.user = user;

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Authorization failed',
        error: error.message,
      });
    }
  };
};
