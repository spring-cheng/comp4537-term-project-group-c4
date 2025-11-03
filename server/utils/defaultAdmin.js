import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 * Default Admin Class
 * Handles creation of default admin user in the database
 */
class DefaultAdmin {
  constructor() {
    this.adminEmail = "admin@admin.com";
    this.adminPassword = "123456";
  }

  /**
   * Create default admin user
   * Creates admin@admin.com with password '123456' if it doesn't exist
   * @returns {Promise<void>}
   */
  async create() {
    try {
      // Check if admin already exists
      const existingAdmin = await User.findByEmail(this.adminEmail);

      if (existingAdmin) {
        console.log("Admin user already exists.");
        return;
      }

      // Hash password
      const passwordHash = await this.hashPassword(this.adminPassword);

      // Create admin user with admin role
      const admin = new User();
      await admin.create(this.adminEmail, passwordHash, "admin");

      this.logAdminCreated();
    } catch (error) {
      console.error("Error creating default admin user:", error);
    }
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Log admin creation success message
   */
  logAdminCreated() {
    console.log("✅ Default admin user created:");
    console.log(`   Email: ${this.adminEmail}`);
    console.log(`   Password: ${this.adminPassword}`);
    console.log(`   Role: admin`);
  }
}

export default new DefaultAdmin();
