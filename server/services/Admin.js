import User from "../models/User.js";
import Database from "../db/Database.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * Admin Service Class
 * Handles admin-related business logic
 */
class Admin {
  /**
   * Initialize endpoint_stats table
   * @static
   */
  static async initEndpointStatsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS endpoint_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        method VARCHAR(10) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        count INT DEFAULT 0,
        UNIQUE KEY unique_endpoint (method, endpoint)
      ) ENGINE=InnoDB;
    `;

    try {
      await Database.query(sql);
      console.log("Endpoint stats table is ready.");
    } catch (err) {
      console.error(`Error creating endpoint_stats table: ${err.message}`);
      throw err;
    }
  }
  /**
   * Get all users with statistics
   * @returns {Promise<Object>} Users and statistics
   */
  async getAllUsers() {
    const users = await User.findAll();

    const totalUsers = users.length;
    const totalApiCalls = users.reduce((sum, user) => sum + (user.api_calls || 0), 0);
    const activeUsers = users.filter((user) => (user.api_calls || 0) > 0).length;

    return {
      users: users,
      statistics: {
        total_users: totalUsers,
        total_api_calls: totalApiCalls,
        active_users: activeUsers,
        average_api_calls_per_user:
          totalUsers > 0 ? (totalApiCalls / totalUsers).toFixed(2) : 0,
      },
    };
  }

  /**
   * Get API usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats() {
    const users = await User.findAll();

    const totalApiCalls = users.reduce((sum, user) => sum + (user.api_calls || 0), 0);
    const usersAtLimit = users.filter(
      (user) =>
        user.role !== "admin" &&
        (user.api_calls || 0) >= userMessages.FREE_API_LIMIT
    ).length;
    const usersWithUsage = users.filter((user) => (user.api_calls || 0) > 0).length;

    return {
      total_api_calls: totalApiCalls,
      users_at_limit: usersAtLimit,
      users_with_usage: usersWithUsage,
      free_api_limit: userMessages.FREE_API_LIMIT,
      total_users: users.length,
    };
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User details
   */
  async getUserById(userId) {
    const user = await User.findByIdWithoutPassword(userId);
    if (!user) {
      throw new Error(userMessages.NOT_FOUND);
    }

    return {
      ...user.toJSON(),
      limit_reached:
        user.role !== "admin" && (user.api_calls || 0) >= userMessages.FREE_API_LIMIT,
      remaining_calls:
        user.role === "admin"
          ? "unlimited"
          : Math.max(0, userMessages.FREE_API_LIMIT - (user.api_calls || 0)),
    };
  }

  /**
   * Reset user API calls
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async resetUserApiCalls(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(userMessages.NOT_FOUND);
    }
    
    await user.resetApiCalls();
  }

  /**
   * Get endpoint usage statistics
   * @returns {Promise<Array>} Array of endpoint stats
   */
  async getEndpointStats() {
    try {
      const [rows] = await Database.query(`
        SELECT method, endpoint, count
        FROM endpoint_stats
        ORDER BY count DESC
      `);
      return rows || [];
    } catch (error) {
      console.error("Error fetching endpoint stats:", error);
      // Return empty array if table doesn't exist or query fails
      if (error.code === "ER_NO_SUCH_TABLE") {
        return [];
      }
      throw new Error(userMessages.SERVER_ERROR);
    }
  }
}

export default Admin;

