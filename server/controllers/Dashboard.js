import DashboardService from "../services/Dashboard.js";
import { userMessages } from "../lang/en/messages.js";

/**
 * Dashboard Controller Class
 * Handles HTTP requests for dashboard
 */
class Dashboard {
    constructor() {
        this.dashboardService = new DashboardService();
    }

    /**
     * Get dashboard data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getDashboard(req, res) {
        try {
            const data = await this.dashboardService.getDashboardData(req.user.id);
            res.json(data);
        } catch (error) {
            console.error("Dashboard error:", error);
            const statusCode = error.message === userMessages.NOT_FOUND ? 404 : 500;
            res.status(statusCode).json({
                error: error.message || userMessages.SERVER_ERROR,
                details: error.message,
            });
        }
    }
}

export default Dashboard;

