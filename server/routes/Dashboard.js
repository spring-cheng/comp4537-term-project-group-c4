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
 *     summary: Get user dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data returned successfully
 *       401:
 *         description: Unauthorized — missing or invalid authentication token
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

