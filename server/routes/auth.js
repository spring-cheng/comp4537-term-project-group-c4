import express from "express";
import AuthController from "../controllers/Auth.js";
import { validateRegisterInput, validateLoginInput } from "../middleware/validation.js";
import authMiddleware from "../middleware/auth.js";

/**
 * Auth Routes Class
 * Handles all authentication-related routes
 */
class Auth {
  constructor() {
    this.router = express.Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  /**
   * Initialize all auth routes
   */
  initializeRoutes() {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    this.router.post("/register", validateRegisterInput, (req, res) => {
      this.authController.register(req, res).catch((err) => {
        console.error("Unhandled error in register:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * POST /api/auth/login
     * Login user
     */
    this.router.post("/login", validateLoginInput, (req, res) => {
      this.authController.login(req, res).catch((err) => {
        console.error("Unhandled error in login:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * GET /api/auth/me
     * Get current user info (requires authentication)
     */
    this.router.get("/me", authMiddleware.authenticateToken(), (req, res) => {
      this.authController.getMe(req, res).catch((err) => {
        console.error("Unhandled error in getMe:", err);
        res.status(500).json({ error: "Internal server error" });
      });
    });

    /**
     * POST /api/auth/logout
     * Logout user (client should discard token)
     */
    this.router.post("/logout", authMiddleware.authenticateToken(), (req, res) => {
      this.authController.logout(req, res);
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

export default Auth;

