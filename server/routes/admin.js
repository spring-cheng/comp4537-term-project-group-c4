import express from "express";
import AdminController from "../controllers/Admin.js";
import authMiddleware from "../middleware/auth.js";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints for monitoring and user management
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with their API usage
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users returned successfully
 *       401:
 *         description: Unauthorized — missing or invalid token in httpOnly cookie
 *       403:
 *         description: Forbidden — user is not an admin
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/usage:
 *   get:
 *     summary: Get global API usage stats
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Usage stats returned successfully
 *       401:
 *         description: Unauthorized — missing or invalid token in httpOnly cookie
 *       403:
 *         description: Forbidden — admin access required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/stats/endpoints:
 *   get:
 *     summary: Get request count for each API endpoint
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Endpoint stats returned successfully
 *       401:
 *         description: Unauthorized — missing or invalid token in httpOnly cookie
 *       403:
 *         description: Forbidden — admin access required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/user/{id}:
 *   get:
 *     summary: Get info about a specific user
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: User details returned successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized — missing or invalid token in httpOnly cookie
 *       403:
 *         description: Forbidden — admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/user/{id}/reset-api-calls:
 *   patch:
 *     summary: Reset a user's API call count to 0
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: API calls reset successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized — missing or invalid token in httpOnly cookie
 *       403:
 *         description: Forbidden — admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * Admin Routes Class
 * Handles all admin-related routes
 */
class Admin {
  constructor() {
    this.router = express.Router();
    this.adminController = new AdminController();
    this.initializeRoutes();
  }

  /**
   * Initialize all admin routes
   */
  initializeRoutes() {
    // All admin routes require authentication and admin role
    this.router.use(authMiddleware.authenticateToken());
    this.router.use(authMiddleware.requireAdmin());

    /**
     * GET /api/admin/users
     * Get all users with their API usage statistics
     */
    this.router.get("/users", (req, res) => {
      this.adminController.getUsers(req, res).catch((err) => {
        console.error("Unhandled error in getUsers:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * GET /api/admin/usage
     * Get API usage statistics summary
     */
    this.router.get("/usage", (req, res) => {
      this.adminController.getUsage(req, res).catch((err) => {
        console.error("Unhandled error in getUsage:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * GET /api/admin/user/:id
     * Get detailed information about a specific user
     */
    this.router.get("/user/:id", (req, res) => {
      this.adminController.getUserById(req, res).catch((err) => {
        console.error("Unhandled error in getUserById:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * PATCH /api/admin/user/:id/reset-api-calls
     * Reset a user's API call count (admin only)
     */
    this.router.patch("/user/:id/reset-api-calls", (req, res) => {
      this.adminController.resetApiCalls(req, res).catch((err) => {
        console.error("Unhandled error in resetApiCalls:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * GET /api/admin/stats/endpoints
     * Get endpoint usage statistics for all tracked API routes
     */
    this.router.get("/stats/endpoints", (req, res) => {
      this.adminController.getEndpointStats(req, res).catch((err) => {
        console.error("Unhandled error in getEndpointStats:", err);
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

export default Admin;

