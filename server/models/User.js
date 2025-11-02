import Database from "../db/Database.js";
import { userMessages } from "../lang/en/messages.js";

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
    this.api_calls = data.api_calls || 0;
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
        api_calls INT DEFAULT 0,
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
      "SELECT id, email, password_hash, role, api_calls, created_at FROM users WHERE email = ?",
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
      "SELECT id, email, password_hash, role, api_calls, created_at \
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
   * Find user by ID 
   * @static
   * @param {number} id - User ID
   * @returns {Promise<User|null>} User instance or null
   */
  static async findByIdWithoutPassword(id) {
    const [rows] = await Database.query(
      "SELECT id, email, role, api_calls, created_at \
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
    this.api_calls = 0;

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
        "UPDATE users SET email = ?, password_hash = ?, role = ?, api_calls = ? WHERE id = ?",
        [this.email, this.password_hash, this.role, this.api_calls, this.id]
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
      await Database.query(
        "UPDATE users SET api_calls = api_calls + 1 WHERE id = ?",
        [this.id]
      );
      this.api_calls = (this.api_calls || 0) + 1;
    }
  }

  /**
   * Reset API calls count
   * @returns {Promise<void>}
   */
  async resetApiCalls() {
    await Database.query("UPDATE users SET api_calls = 0 WHERE id = ?", [
      this.id,
    ]);
    this.api_calls = 0;
  }

  /**
   * Get all users
   * @static
   * @returns {Promise<Array<User>>} Array of user instances
   */
  static async findAll() {
    const [rows] = await Database.query(
      "SELECT id, email, role, api_calls, created_at FROM users ORDER BY created_at DESC"
    );

    return rows.map((row) => new User(row));
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
      api_calls: this.api_calls || 0,
      created_at: this.created_at,
    };
  }
}

export default User;

