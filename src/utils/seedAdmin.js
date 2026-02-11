import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

/**
 * Seed Default Admin
 * - Runs once on server start
 * - Creates admin only if not already present
 * - Uses environment variables
 */
const seedAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    /* ================= VALIDATION ================= */

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.warn(
        '⚠️ Admin seed skipped: Missing ADMIN_NAME, ADMIN_EMAIL or ADMIN_PASSWORD in .env',
      );
      return;
    }

    /* ================= CHECK IF ADMIN EXISTS ================= */

    const existingAdmin = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    });

    if (existingAdmin) {
      console.log('ℹ️ Default admin already exists. Seed skipped.');
      return;
    }

    /* ================= HASH PASSWORD ================= */

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    /* ================= CREATE ADMIN ================= */

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Default admin created successfully');
  } catch (error) {
    console.error('❌ Admin seeding failed:', error.message);
  }
};

export default seedAdmin;
