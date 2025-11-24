import Database from "../db/Database.js";
import { userMessages } from "../lang/en/messages.js";
import UserApiUsage from "./UserApiUsage.js";

/**
 * User Model Class
 * Handles all database operations related to users
 */
class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || null;
    this.password_hash = data.password_hash || null;
    this.role = data.role || "user";
    this.created_at = data.created_at || null;
  }

  /**
   * Initialize users table
   * @static
   */
  static async initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;

    try {
      await Database.query(sql);
      console.log(userMessages.USERS_TABLE_READY);
    } catch (err) {
      console.error(`${userMessages.USER_CREATE_ERROR} ${err.message}`);
      throw err;
    }
  }

  /**
   * Find user by email
   * @static
   * @param {string} email - User email
   * @returns {Promise<User|null>} User instance or null
   */
  static async findByEmail(email) {
    const [rows] = await Database.query(
      "SELECT id, email, password_hash, role, created_at FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    return new User(rows[0]);
  }

  /**
   * Find user by ID
   * @static
   * @param {number} id - User ID
   * @returns {Promise<User|null>} User instance or null
   */
  static async findById(id) {
    const [rows] = await Database.query(
      "SELECT id, email, password_hash, role, created_at \
      FROM users WHERE id = ? \
      LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return new User(rows[0]);
  }

  /**
   * Find user by ID with API usage
   * @static
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User data with api_calls or null
   */
  static async findByIdWithoutPassword(id) {
    const [rows] = await Database.query(
      "SELECT id, email, role, created_at \
      FROM users WHERE id = ? \
      LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = new User(rows[0]);
    const apiCalls = await UserApiUsage.getApiCalls(id);

    return { ...user, api_calls: apiCalls };
  }

  /**
   * Check if email exists
   * @static
   * @param {string} email - User email
   * @returns {Promise<boolean>} True if exists
   */
  static async emailExists(email) {
    const [rows] = await Database.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    return rows.length > 0;
  }

  /**
   * Create a new user
   * @param {string} email - User email
   * @param {string} passwordHash - Hashed password
   * @param {string} role - User role (optional, defaults to 'user')
   * @returns {Promise<User>} Created user instance
   */
  async create(email, passwordHash, role = "user") {
    const [result] = await Database.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
      [email, passwordHash, role]
    );

    this.id = result.insertId;
    this.email = email;
    this.password_hash = passwordHash;
    this.role = role;

    // Initialize API usage entry
    await UserApiUsage.getApiCalls(this.id);

    return this;
  }

  /**
   * Save user to database
   * @returns {Promise<User>} Updated user instance
   */
  async save() {
    if (this.id) {
      // Update existing user
      await Database.query(
        "UPDATE users SET email = ?, password_hash = ?, role = ? WHERE id = ?",
        [this.email, this.password_hash, this.role, this.id]
      );
    } else {
      // Insert new user
      await this.create(this.email, this.password_hash);
    }

    return this;
  }

  /**
   * Increment API calls count
   * @returns {Promise<void>}
   */
  async incrementApiCalls() {
    if (this.role !== "admin") {
      await UserApiUsage.incrementApiCalls(this.id);
    }
  }

  /**
   * Reset API calls count
   * @returns {Promise<void>}
   */
  async resetApiCalls() {
    await UserApiUsage.resetApiCalls(this.id);
  }

  /**
   * Get API calls count
   * @returns {Promise<number>} API calls count
   */
  async getApiCalls() {
    return await UserApiUsage.getApiCalls(this.id);
  }

  /**
   * Get all users with API usage
   * @static
   * @returns {Promise<Array<Object>>} Array of user data with api_calls
   */
  static async findAll() {
    const [rows] = await Database.query(`
      SELECT
        u.id,
        u.email,
        u.role,
        u.created_at,
        COALESCE(uau.api_calls, 0) as api_calls
      FROM users u
      LEFT JOIN user_api_usage uau ON u.id = uau.user_id
      ORDER BY u.created_at DESC
    `);

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      api_calls: row.api_calls,
      created_at: row.created_at
    }));
  }

  /**
   * Convert user to JSON (without sensitive data)
   * @returns {Object} User data
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      created_at: this.created_at,
    };
  }

  /**
   * Convert user to JSON with API usage
   * @returns {Promise<Object>} User data with api_calls
   */
  async toJSONWithUsage() {
    const apiCalls = await this.getApiCalls();
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      api_calls: apiCalls,
      created_at: this.created_at,
    };
  }

  /**
   * Delete user account
   * @returns {Promise<void>}
   */
  async delete() {
    if (!this.id) {
      throw new Error("Cannot delete user without ID");
    }

    await Database.query("DELETE FROM users WHERE id = ?", [this.id]);
  }

  /**
   * Delete user by ID
   * @static
   * @param {number} id - User ID
   * @returns {Promise<void>}
   */
  static async deleteById(id) {
    await Database.query("DELETE FROM users WHERE id = ?", [id]);
  }
}

export default User;

