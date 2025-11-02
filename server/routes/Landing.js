import express from "express";
import LandingController from "../controllers/Landing.js";
import authMiddleware from "../middleware/auth.js";

/**
 * Landing Routes Class
 * Handles landing page routes
 */
class Landing {
  constructor() {
    this.router = express.Router();
    this.landingController = new LandingController();
    this.initializeRoutes();
  }

  /**
   * Initialize all landing routes
   */
  initializeRoutes() {
    /**
     * GET /api/landing
     * Get landing page data based on user role
     * Returns different data for admin vs regular users
     */
    this.router.get("/", authMiddleware.authenticateToken(), (req, res) => {
      this.landingController.getLanding(req, res).catch((err) => {
        console.error("Unhandled error in getLanding:", err);
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

export default Landing;

