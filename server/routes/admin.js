import express from "express";
import AdminController from "../controllers/Admin.js";
import authMiddleware from "../middleware/auth.js";

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

