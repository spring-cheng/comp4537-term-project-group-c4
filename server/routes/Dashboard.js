import express from "express";
import DashboardController from "../controllers/Dashboard.js";
import authMiddleware from "../middleware/auth.js";

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: User dashboard endpoints
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get user dashboard data including API usage statistics
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     api_calls:
 *                       type: integer
 *                 api_usage:
 *                   type: object
 *                   properties:
 *                     api_calls:
 *                       type: integer
 *                       description: Current number of API calls made
 *                     limit:
 *                       type: integer
 *                       description: Free API call limit (default 20)
 *                       example: 20
 *                     remaining_calls:
 *                       type: integer
 *                       description: Remaining free API calls (or "unlimited" for admin)
 *                     limit_reached:
 *                       type: boolean
 *                       description: Whether the free API call limit has been reached
 *       401:
 *         description: Unauthorized — missing or invalid authentication token in httpOnly cookie
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * Dashboard Routes Class
 * Handles dashboard routes
 */
class Dashboard {
    constructor() {
        this.router = express.Router();
        this.dashboardController = new DashboardController();
        this.initializeRoutes();
    }

    /**
     * Initialize all dashboard routes
     */
    initializeRoutes() {
        /**
         * GET /api/dashboard
         * Get dashboard data for the authenticated user
         */
        this.router.get("/", authMiddleware.authenticateToken(), (req, res) => {
            this.dashboardController.getDashboard(req, res).catch((err) => {
                console.error("Unhandled error in getDashboard:", err);
                res.status(500).json({ error: "Internal server error" });
            });
        });
    }

    /**
     * Get the router instance
     * @returns {express.Router} Express router
     */
    getRouter() {
        return this.router;
    }
}

export default Dashboard;

