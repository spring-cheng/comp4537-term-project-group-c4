import User from "../models/User.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * Admin Service Class
 * Handles admin-related business logic
 */
class Admin {
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
      users: users.map((user) => user.toJSON()),
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

    if (user.role === "admin") {
      throw new Error("Cannot reset API calls for admin users.");
    }

    await user.resetApiCalls();
  }
}

export default Admin;

