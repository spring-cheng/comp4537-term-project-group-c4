import express from "express";
import LandingController from "../controllers/Landing.js";
import authMiddleware from "../middleware/auth.js";

/**
 * @swagger
 * tags:
 *   name: Landing
 *   description: Landing page endpoint (role-based content)
 */

/**
 * @swagger
 * /api/landing:
 *   get:
 *     summary: Get landing page content depending on user role
 *     tags: [Landing]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Landing page data returned successfully
 *       400:
 *         description: Bad request or missing required fields
 *       401:
 *         description: Unauthorized — missing or invalid authentication token in httpOnly cookie
 *       403:
 *         description: Forbidden — user role does not have access
 *       500:
 *         description: Internal server error
 */

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

