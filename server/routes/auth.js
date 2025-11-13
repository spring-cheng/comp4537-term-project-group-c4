import express from "express";
import AuthController from "../controllers/Auth.js";
import { validateRegisterInput, validateLoginInput } from "../middleware/validation.js";
import authMiddleware from "../middleware/auth.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and account operations
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request — email already exists or validation failed
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and return JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful — JWT token returned
 *       400:
 *         description: Bad request — missing fields or invalid JSON
 *       401:
 *         description: Unauthorized — invalid email or password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info returned
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (client should delete token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Internal server error
 */

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

