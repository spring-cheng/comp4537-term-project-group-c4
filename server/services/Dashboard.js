import User from "../models/User.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * Dashboard Service Class
 * Handles dashboard-related business logic
 */
class DashboardService {
    /**
     * Get dashboard data for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Dashboard data
     */
    async getDashboardData(userId) {
        const user = await User.findByIdWithoutPassword(userId);
        if (!user) {
            throw new Error(userMessages.NOT_FOUND);
        }

        // Calculate remaining API calls
        const apiCalls = user.api_calls || 0;
        const limit = userMessages.FREE_API_LIMIT || 20;
        const remainingCalls = user.role === "admin"
            ? "unlimited"
            : Math.max(0, limit - apiCalls);
        const limitReached = user.role !== "admin" && apiCalls >= limit;

        return {
            user: user.toJSON(),
            api_usage: {
                api_calls: apiCalls,
                limit: limit,
                remaining_calls: remainingCalls,
                limit_reached: limitReached,
            },
        };
    }
}

export default DashboardService;

