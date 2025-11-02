import User from "../models/User.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * User Service Class
 * Handles user-related business logic
 */
class UserService {
  /**
   * Get user landing page data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Landing page data
   */
  async getLandingData(userId) {
    const user = await User.findByIdWithoutPassword(userId);
    if (!user) {
      throw new Error(userMessages.NOT_FOUND);
    }

    if (user.role === "admin") {
      return this.getAdminLandingData(user);
    } else {
      return this.getUserLandingData(user);
    }
  }

  /**
   * Get admin landing page data
   * @param {User} user - Admin user instance
   * @returns {Promise<Object>} Admin dashboard data
   */
  async getAdminLandingData(user) {
    const allUsers = await User.findAll();

    // Calculate statistics
    const totalUsers = allUsers.length;
    const totalApiCalls = allUsers.reduce((sum, u) => sum + (u.api_calls || 0), 0);
    const activeUsers = allUsers.filter((u) => (u.api_calls || 0) > 0).length;
    const usersAtLimit = allUsers.filter(
      (u) => u.role !== "admin" && (u.api_calls || 0) >= userMessages.FREE_API_LIMIT
    ).length;

    return {
      role: "admin",
      user: user.toJSON(),
      dashboard: {
        statistics: {
          total_users: totalUsers,
          total_api_calls: totalApiCalls,
          active_users: activeUsers,
          users_at_limit: usersAtLimit,
          average_api_calls_per_user:
            totalUsers > 0 ? (totalApiCalls / totalUsers).toFixed(2) : 0,
        },
        users: allUsers.map((u) => ({
          ...u.toJSON(),
          limit_reached:
            u.role !== "admin" && (u.api_calls || 0) >= userMessages.FREE_API_LIMIT,
          remaining_calls:
            u.role === "admin"
              ? "unlimited"
              : Math.max(0, userMessages.FREE_API_LIMIT - (u.api_calls || 0)),
        })),
      },
    };
  }

  /**
   * Get regular user landing page data
   * @param {User} user - User instance
   * @returns {Object} User landing page data
   */
  getUserLandingData(user) {
    return {
      role: "user",
      user: user.toJSON(),
      api_usage: {
        api_calls: user.api_calls || 0,
        limit: userMessages.FREE_API_LIMIT,
        remaining_calls: Math.max(
          0,
          userMessages.FREE_API_LIMIT - (user.api_calls || 0)
        ),
        limit_reached: (user.api_calls || 0) >= userMessages.FREE_API_LIMIT,
      },
    };
  }
}

export default UserService;

