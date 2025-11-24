import Database from "../db/Database.js";

/**
 * UserApiUsage Model Class
 * Handles API usage statistics separate from user info
 */
class UserApiUsage {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.api_calls = data.api_calls || 0;
    this.created_at = data.created_at || null;
  }

  /**
   * Initialize user_api_usage table
   * @static
   */
  static async initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS user_api_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        api_calls INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    try {
      await Database.query(sql);
      console.log("User API usage table is ready.");
    } catch (err) {
      console.error(`Error creating user_api_usage table: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get API usage for a user
   * @static
   * @param {number} userId - User ID
   * @returns {Promise<number>} API call count
   */
  static async getApiCalls(userId) {
    const [rows] = await Database.query(
      "SELECT api_calls FROM user_api_usage WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      // Create entry if doesn't exist
      await Database.query(
        "INSERT INTO user_api_usage (user_id, api_calls) VALUES (?, 0)",
        [userId]
      );
      return 0;
    }

    return rows[0].api_calls || 0;
  }

  /**
   * Increment API calls for a user
   * @static
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  static async incrementApiCalls(userId) {
    await Database.query(
      `INSERT INTO user_api_usage (user_id, api_calls)
       VALUES (?, 1)
       ON DUPLICATE KEY UPDATE api_calls = api_calls + 1`,
      [userId]
    );
  }

  /**
   * Reset API calls for a user
   * @static
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  static async resetApiCalls(userId) {
    await Database.query(
      "UPDATE user_api_usage SET api_calls = 0 WHERE user_id = ?",
      [userId]
    );
  }
}

export default UserApiUsage;
